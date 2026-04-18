import { layoutNextLine, layoutWithLines, prepareWithSegments, walkLineRanges } from '@chenglou/pretext';

type PretextElement = HTMLElement & {
  dataset: DOMStringMap & {
    pretextSource?: string;
    pretextMinWidth?: string;
    pretextMaxWidth?: string;
  };
};

const preparedCache = new Map<string, ReturnType<typeof prepareWithSegments>>();
const atlasStates: AtlasState[] = [];

type AtlasLane = 'left' | 'right';

type AtlasCardElement = HTMLButtonElement & {
  dataset: DOMStringMap & {
    lane?: AtlasLane;
    top?: string;
  };
};

type AtlasCardState = {
  element: AtlasCardElement;
  lane: AtlasLane;
  top: number;
};

type AtlasCardGeometry = AtlasCardState & {
  x: number;
  width: number;
  height: number;
};

type AtlasState = {
  root: HTMLElement;
  viewport: HTMLElement;
  lines: HTMLElement;
  source: HTMLElement;
  cards: AtlasCardState[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildFont(style: CSSStyleDeclaration): string {
  const parts = [
    style.fontStyle,
    style.fontVariantCaps && style.fontVariantCaps !== 'normal' ? style.fontVariantCaps : '',
    style.fontWeight,
    style.fontStretch && style.fontStretch !== '100%' ? style.fontStretch : '',
    style.fontSize,
    style.fontFamily,
  ];

  return parts.filter(Boolean).join(' ');
}

function getLineHeight(style: CSSStyleDeclaration): number {
  const parsed = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(parsed)) return parsed;
  return Number.parseFloat(style.fontSize) * 1.05;
}

function getPrepared(text: string, font: string) {
  const cacheKey = `${font}\u0000${text}`;
  const cached = preparedCache.get(cacheKey);
  if (cached) return cached;

  const prepared = prepareWithSegments(text, font);
  preparedCache.set(cacheKey, prepared);
  return prepared;
}

function countLines(prepared: ReturnType<typeof prepareWithSegments>, width: number): number {
  return walkLineRanges(prepared, width, () => {});
}

function getAvailableWidth(element: PretextElement): number {
  const parentWidth = element.parentElement?.clientWidth ?? element.clientWidth;
  const maxWidth = Number.parseFloat(element.dataset.pretextMaxWidth ?? '');
  const availableWidth = Number.isFinite(maxWidth) ? Math.min(parentWidth, maxWidth) : parentWidth;
  return Math.max(1, Math.floor(availableWidth));
}

function getTightWidth(
  prepared: ReturnType<typeof prepareWithSegments>,
  maxWidth: number,
  targetLines: number,
  minWidth: number,
): number {
  let lo = Math.max(1, Math.floor(minWidth));
  let hi = Math.max(lo, Math.floor(maxWidth));

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const lineCount = countLines(prepared, mid);

    if (lineCount <= targetLines) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return lo;
}

function getSourceText(element: PretextElement): string {
  return (
    element.dataset.pretextSource ??
    element.getAttribute('aria-label') ??
    element.textContent?.replace(/\s+/g, ' ').trim() ??
    ''
  );
}

function enhanceBalanced(element: PretextElement): void {
  const text = getSourceText(element);
  if (!text) return;

  const style = getComputedStyle(element);
  const font = buildFont(style);
  const lineHeight = getLineHeight(style);
  const prepared = getPrepared(text, font);
  const availableWidth = getAvailableWidth(element);
  const targetLines = countLines(prepared, availableWidth);

  if (targetLines <= 1) {
    element.textContent = text;
    element.style.removeProperty('width');
    element.dataset.pretextEnhanced = 'false';
    return;
  }

  const minWidth =
    Number.parseFloat(element.dataset.pretextMinWidth ?? '') ||
    Number.parseFloat(style.fontSize) * 2.75;
  const tightWidth = getTightWidth(prepared, availableWidth, targetLines, minWidth);
  const result = layoutWithLines(prepared, tightWidth, lineHeight);

  element.setAttribute('aria-label', text);
  element.replaceChildren(
    ...result.lines.map((line) => {
      const lineElement = document.createElement('span');
      lineElement.className = 'pretext-line';
      lineElement.textContent = line.text;
      lineElement.style.width = `${Math.ceil(line.width)}px`;
      return lineElement;
    }),
  );
  element.style.width = `${Math.ceil(tightWidth)}px`;
  element.style.maxWidth = '100%';
  element.dataset.pretextEnhanced = 'true';
}

function enhanceShrinkwrap(element: PretextElement): void {
  const text = getSourceText(element);
  if (!text) return;

  const style = getComputedStyle(element);
  const font = buildFont(style);
  const prepared = getPrepared(text, font);
  const availableWidth = getAvailableWidth(element);
  const targetLines = countLines(prepared, availableWidth);
  const minWidth =
    Number.parseFloat(element.dataset.pretextMinWidth ?? '') ||
    Number.parseFloat(style.fontSize) * 4;
  const tightWidth = getTightWidth(prepared, availableWidth, targetLines, minWidth);

  element.style.width = `${Math.ceil(tightWidth)}px`;
  element.style.maxWidth = `${availableWidth}px`;
  element.dataset.pretextEnhanced = 'true';
}

function createAtlasState(root: HTMLElement, schedule: () => void): AtlasState | null {
  const viewport = root.querySelector<HTMLElement>('[data-pretext-atlas-viewport]');
  const lines = root.querySelector<HTMLElement>('[data-pretext-atlas-lines]');
  const source = root.querySelector<HTMLElement>('[data-pretext-atlas-source]');
  const cards = Array.from(root.querySelectorAll<AtlasCardElement>('[data-pretext-atlas-card]')).map(
    (element) => ({
      element,
      lane: element.dataset.lane === 'left' ? 'left' : 'right',
      top: Number.parseFloat(element.dataset.top ?? '0') || 0,
    }),
  );

  if (!viewport || !lines || !source) return null;

  const state: AtlasState = { root, viewport, lines, source, cards };

  cards.forEach((card) => {
    card.element.addEventListener('pointerdown', (event) => {
      const rect = viewport.getBoundingClientRect();
      const cardRect = card.element.getBoundingClientRect();
      const offsetY = event.clientY - cardRect.top;
      const compact = root.dataset.pretextAtlasCompact === 'true';

      if (compact) return;

      card.element.dataset.dragging = 'true';
      card.element.setPointerCapture(event.pointerId);

      const onMove = (moveEvent: PointerEvent) => {
        const localX = moveEvent.clientX - rect.left;
        const localY = moveEvent.clientY - rect.top - offsetY;
        const maxTop = Math.max(24, viewport.clientHeight - card.element.offsetHeight - 24);

        card.lane = localX < rect.width / 2 ? 'left' : 'right';
        card.top = clamp(localY, 24, maxTop);
        schedule();
      };

      const finish = () => {
        card.element.dataset.dragging = 'false';
        card.element.removeEventListener('pointermove', onMove);
        card.element.removeEventListener('pointerup', finish);
        card.element.removeEventListener('pointercancel', finish);
        schedule();
      };

      card.element.addEventListener('pointermove', onMove);
      card.element.addEventListener('pointerup', finish);
      card.element.addEventListener('pointercancel', finish);
    });

    card.element.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 48 : 24;
      const maxTop = Math.max(24, state.viewport.clientHeight - card.element.offsetHeight - 24);
      let handled = true;

      switch (event.key) {
        case 'ArrowUp':
          card.top = clamp(card.top - step, 24, maxTop);
          break;
        case 'ArrowDown':
          card.top = clamp(card.top + step, 24, maxTop);
          break;
        case 'ArrowLeft':
          card.lane = 'left';
          break;
        case 'ArrowRight':
          card.lane = 'right';
          break;
        case 'Home':
          card.top = 24;
          break;
        case 'End':
          card.top = maxTop;
          break;
        default:
          handled = false;
      }

      if (!handled) return;

      event.preventDefault();
      schedule();
    });
  });

  return state;
}

function getAtlasGeometry(
  cards: AtlasCardGeometry[],
  y: number,
  lineHeight: number,
  stageWidth: number,
  padding: number,
  gap: number,
) {
  const bandTop = y;
  const bandBottom = y + lineHeight;
  const active = cards.filter((card) => bandTop < card.top + card.height && bandBottom > card.top);
  let left = padding;
  let right = stageWidth - padding;

  active.forEach((card) => {
    if (card.lane === 'left') {
      left = Math.max(left, card.x + card.width + gap);
    } else {
      right = Math.min(right, card.x - gap);
    }
  });

  return {
    x: left,
    width: right - left,
    active,
  };
}

function getNextAtlasClearY(active: AtlasCardGeometry[], y: number, lineHeight: number, gap: number): number {
  if (active.length === 0) return y + lineHeight;
  return Math.max(
    y + lineHeight,
    Math.min(...active.map((card) => card.top + card.height + gap)),
  );
}

function renderAtlas(state: AtlasState): void {
  const text = state.source.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (!text) return;

  const stageWidth = state.viewport.clientWidth;
  if (stageWidth <= 0) return;

  const compact = stageWidth < 780;
  state.root.dataset.pretextAtlasCompact = compact ? 'true' : 'false';

  const style = getComputedStyle(state.lines);
  const font = buildFont(style);
  const lineHeight = getLineHeight(style);
  const prepared = getPrepared(text, font);
  const padding = compact ? 20 : 28;
  const gap = compact ? 0 : 18;
  const minLineWidth = compact ? 220 : 156;
  const minHeight = compact ? 280 : 520;

  const renderedCards: AtlasCardGeometry[] = [];
  if (!compact) {
    const laneWidth = Math.min(248, Math.max(186, stageWidth * 0.3));
    const maxReferenceHeight = Math.max(state.viewport.clientHeight, minHeight);

    state.cards.forEach((card) => {
      card.element.style.width = `${Math.round(laneWidth)}px`;
    });

    state.cards.forEach((card) => {
      const width = card.element.offsetWidth;
      const height = card.element.offsetHeight;
      const x = card.lane === 'left' ? padding : stageWidth - padding - width;
      const maxTop = Math.max(padding, maxReferenceHeight - height - padding);
      card.top = clamp(card.top, padding, maxTop);
      card.element.style.transform = `translate(${Math.round(x)}px, ${Math.round(card.top)}px)`;
      card.element.dataset.lane = card.lane;
      renderedCards.push({ ...card, x, width, height });
    });
  } else {
    state.cards.forEach((card) => {
      card.element.style.removeProperty('transform');
      card.element.style.removeProperty('width');
      card.element.dataset.lane = card.lane;
    });
  }

  const fragment = document.createDocumentFragment();
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = padding;
  let guard = 0;

  while (guard < 2000) {
    guard += 1;
    const geometry = getAtlasGeometry(renderedCards, y, lineHeight, stageWidth, padding, gap);

    if (geometry.width < minLineWidth) {
      y = getNextAtlasClearY(geometry.active, y, lineHeight, gap || 12);
      continue;
    }

    const line = layoutNextLine(prepared, cursor, geometry.width);
    if (line === null) break;

    const lineElement = document.createElement('span');
    lineElement.className = 'pretext-atlas__line';
    lineElement.textContent = line.text;
    lineElement.style.transform = `translate(${Math.round(geometry.x)}px, ${Math.round(y)}px)`;
    lineElement.style.width = `${Math.ceil(line.width)}px`;
    fragment.appendChild(lineElement);

    cursor = line.end;
    y += lineHeight;
  }

  state.lines.replaceChildren(fragment);
  state.root.dataset.pretextAtlasReady = 'true';

  const maxCardBottom =
    renderedCards.length > 0
      ? Math.max(...renderedCards.map((card) => card.top + card.height))
      : 0;
  const nextHeight = Math.max(minHeight, y + padding, maxCardBottom + padding);
  state.viewport.style.height = `${Math.ceil(nextHeight)}px`;
}

function runEnhancements(): void {
  const balancedElements = Array.from(
    document.querySelectorAll<PretextElement>('[data-pretext-balance]'),
  );
  const shrinkwrapElements = Array.from(
    document.querySelectorAll<PretextElement>('[data-pretext-shrinkwrap]'),
  );

  balancedElements.forEach(enhanceBalanced);
  shrinkwrapElements.forEach(enhanceShrinkwrap);
}

function renderAtlases(): void {
  atlasStates.forEach((state) => renderAtlas(state));
}

function initPretextEnhancements(): void {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      runEnhancements();
      renderAtlases();
    });
  };

  atlasStates.splice(
    0,
    atlasStates.length,
    ...Array.from(document.querySelectorAll<HTMLElement>('[data-pretext-atlas]'))
      .map((root) => createAtlasState(root, schedule))
      .filter((state): state is AtlasState => Boolean(state)),
  );

  if ('fonts' in document) {
    document.fonts.ready.then(schedule).catch(schedule);
  } else {
    schedule();
  }

  window.addEventListener('resize', schedule, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    document
      .querySelectorAll<HTMLElement>(
        '[data-pretext-balance], [data-pretext-shrinkwrap], [data-pretext-atlas], [data-pretext-atlas-viewport]',
      )
      .forEach((element) => {
        if (element.parentElement) observer.observe(element.parentElement);
        observer.observe(element);
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPretextEnhancements, { once: true });
} else {
  initPretextEnhancements();
}
