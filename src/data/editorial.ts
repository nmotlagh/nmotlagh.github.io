import { person } from './site';

/**
 * Homepage copy. Every number here traces to a source: src/content/publications,
 * src/content/pages/experience.mdx, public/resume.pdf, or the public README of
 * github.com/nmotlagh/learning-idk (modern-backbones branch). Don't add a claim
 * without one.
 */

const base = import.meta.env.BASE_URL;

export const homeEditorial = {
  hero: {
    eyebrow: 'Machine learning · Research & engineering',
    title: person.name,
    ledeHtml: 'I develop machine learning methods for <em>computer vision and natural language processing.</em>',
    supporting:
      'PhD, Ohio State (2026). Four first-author peer-reviewed papers and a Springer Best Paper Award. My dissertation connects abstention, ambiguity, and recoverability.',
    /** Terminal line: the real repository for the award-winning paper. */
    terminal: { command: 'git clone https://github.com/osu-cvl/learning-idk', href: 'https://github.com/osu-cvl/learning-idk' },
  },
  work: {
    eyebrow: 'Selected work',
    title: 'What I’ve built.',
    dim: 'Scale, stack, and status for each.',
  },
};

export interface WorkLink {
  label: string;
  href: string;
}

export interface CaseStudy {
  /** Anchor id on the homepage; skill evidence links point here. */
  id: string;
  /** Line-art figure drawn by WorkFigure.astro. */
  figure: 'outcomes' | 'threshold' | 'imagery';
  /** Short context shown in the figure's corner tag. */
  context: string;
  title: string;
  /** One line: the problem. */
  problem: string;
  /** What I built, in one or more labelled groups. Items may wrap numbers in <strong>. */
  built: { label: string; items: string[] }[];
  stack: string[];
  /** Honest status: a short tag plus the full sentence. */
  statusTag: string;
  status: string;
  links: WorkLink[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'work-recoverability',
    figure: 'outcomes',
    context: 'Dissertation capstone',
    title: 'Should a RAG system keep its draft or revise it?',
    problem:
      'Revision can repair a wrong answer or harm a right one. The system has to choose before paying for the full revision.',
    built: [
      {
        label: 'What I built',
        items: [
          'A paired-outcome evaluation on <strong>25,870</strong> held-out questions from NQ-Open, TriviaQA, and PopQA. Each answer is scored as preserved, repaired, harmed, or unrecovered.',
          'Three retrieval setups over Wikipedia: DPR dense retrieval, BM25, and BM25→MonoT5 reranking. Llama 3.1 8B Instruct drafts and revises, Llama 3.3 70B Instruct judges, and gpt-oss-20b and OLMo 3 7B are secondary generators.',
          'Fine-tuned return-or-revise policies using LoRA; scorers estimate repair, harm, and tie outcomes.',
          '<strong>3</strong> training seeds with paired run-level t-tests, and <strong>10,000</strong>-replicate bootstrap intervals for baselines. Thresholds are picked on dev and frozen before test.',
        ],
      },
    ],
    stack: ['PyTorch', 'HF Transformers', 'LoRA', 'vLLM', 'FAISS', 'Slurm'],
    statusTag: 'Preprint',
    status:
      'Public arXiv preprint: Return or Revise?, v1 posted September 24, 2026; not peer-reviewed. Work spanned OSU and DCS; completed at DCS. Code and artifacts will not be released.',
    links: [
      { label: 'Preprint', href: 'https://arxiv.org/abs/2609.30087' },
      { label: 'Case study', href: `${base}publications/adaptive-qa-abstention/` },
    ],
  },
  {
    id: 'work-reject-option',
    figure: 'threshold',
    context: 'ISVC 2022 · MVA 2025 · 2026',
    title: 'Reject-option classification, from Best Paper to live demo',
    problem:
      'A classifier should decline its least reliable predictions without a hand-set rejection cost or coverage target.',
    built: [
      {
        label: 'The method · 2022',
        items: [
          'Per-class softmax thresholds learned from validation data with a binomial-CDF test: keep declining only while the declined predictions are no better than a coin flip.',
          'On ImageNet validation, the method achieves <strong>97.4%</strong> selective accuracy at <strong>79.7%</strong> coverage. On CIFAR-100, selective accuracy rises from 88.3% to 97.8% at 77.3% coverage. The journal extension evaluates benchmark image and text datasets and twelve synthetic variants (four 2-D datasets, each with three variants).',
        ],
      },
      {
        label: 'The 2026 re-run',
        items: [
          'Linear probes on <strong>4</strong> frozen backbones (DINOv2 ViT-S/14 and ViT-B/14, DINOv3 ViT-S/16, SigLIP 2 ViT-B/16), logits from a local RTX 4090, and a fast NumPy B-CDF matched to the reference by 37 parity tests.',
        ],
      },
      {
        label: 'The demo',
        items: [
          'The site’s live demo applies the rule to 1,000 test images, with a draggable threshold and δ controls.',
        ],
      },
    ],
    stack: ['Python', 'PyTorch', 'timm', 'NumPy', 'uv'],
    statusTag: 'Best Paper · Code public',
    status:
      'Method peer-reviewed: Springer Best Paper Award at ISVC 2022, journal extension in Machine Vision and Applications (2025). The 2026 re-run is public code, not peer-reviewed.',
    links: [
      { label: 'Code', href: 'https://github.com/osu-cvl/learning-idk' },
      { label: '2026 re-run code', href: 'https://github.com/nmotlagh/learning-idk/tree/modern-backbones/examples/modern-backbones' },
      { label: 'Live demo', href: '#demo' },
    ],
  },
  {
    id: 'work-imagery',
    figure: 'imagery',
    context: 'WMT 2024',
    title: 'Does a multimodal translation model use the image?',
    problem: 'Translation scores alone can’t show whether a model reads the image or ignores it.',
    built: [
      {
        label: 'What I built',
        items: [
          'ImageCoMMuTE: contrastive metrics that hold a candidate translation fixed and swap in matched or mismatched images, testing image–translation consistency.',
          'Evaluated three English-to-French multimodal model families, plus gated variants.',
          'VGAMT scores <strong>81% IC</strong> and <strong>63% TC</strong> on contrastive image/translation diagnostics. Against mixed imagery, preference flips are <strong>13% favorable</strong> and <strong>0% unfavorable</strong>; these scores do not measure generated-translation accuracy.',
        ],
      },
    ],
    stack: [],
    statusTag: 'Peer-reviewed',
    status: 'Peer-reviewed, WMT 2024.',
    links: [
      { label: 'Paper', href: 'https://aclanthology.org/2024.wmt-1.130.pdf' },
      { label: 'Details', href: `${base}publications/assessing-imagery-in-multimodal-mt/` },
    ],
  },
];

/** Smaller public projects, listed compactly after the case studies. */
export interface SmallWork {
  title: string;
  context: string;
  summary: string;
  stack: string[];
  links: WorkLink[];
}

export const moreWork: SmallWork[] = [
  {
    title: 'Temporal satellite imagery collection',
    context: 'ICCV 2021 Workshop · Code public',
    summary:
      'An OpenStreetMap-guided Python pipeline that extracts candidate construction-site regions and downloads imagery over time. Rebuilt in 2026 as one package with swappable history and imagery backends and a 410-test suite.',
    stack: ['Python', 'OpenStreetMap', 'STAC'],
    links: [
      { label: 'Code', href: 'https://github.com/nmotlagh/Construction-Site-Satellite-Imagery-Collection' },
      { label: 'Details', href: `${base}publications/framework-for-semi-automatic-collection/` },
    ],
  },
  {
    title: 'Model calibration utilities',
    context: 'Code public',
    summary:
      'PyTorch utilities for histogram binning and global and class-wise temperature scaling, with expected-calibration-error summaries and calibration plots.',
    stack: ['Python', 'PyTorch'],
    links: [{ label: 'Code', href: 'https://github.com/osu-cvl/calibration' }],
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
  /** One line of proof: where these were used. */
  proof: string;
  evidence: WorkLink[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: 'LLMs & post-training',
    // Keep current DCS work at the generalized scope of the reviewed resume.
    items: ['LoRA / PEFT', 'Synthetic QA datasets', 'vLLM', 'HF Transformers'],
    proof: 'Fine-tuned return-or-revise policies for the public preprint. At DCS, develop synthetic question-answer datasets from domain-specific documents and train QA models.',
    evidence: [
      { label: 'RAG revision', href: '#work-recoverability' },
      { label: 'DCS role', href: '#experience' },
    ],
  },
  {
    label: 'Retrieval',
    items: ['DPR dense retrieval', 'BM25', 'MonoT5 reranking', 'FAISS'],
    proof: 'Three Wikipedia retrieval setups behind a 25,870-question evaluation.',
    evidence: [{ label: 'RAG revision', href: '#work-recoverability' }],
  },
  {
    label: 'Evaluation',
    items: ['Paired outcomes', 'Seeds + paired t-tests', 'Bootstrap intervals', 'LLM-as-judge', 'Selective prediction', 'Calibration (ECE, Brier)'],
    proof: '3 seeds with paired t-tests and 10,000-replicate bootstraps; a reimplementation checked against its reference by 37 parity tests.',
    evidence: [
      { label: 'RAG revision', href: '#work-recoverability' },
      { label: 'Reject option', href: '#work-reject-option' },
    ],
  },
  {
    label: 'Vision',
    items: ['ViTs', 'Linear probes on DINOv2, DINOv3, SigLIP 2', 'Self-supervised pretraining'],
    proof: 'Probes on four frozen ViT backbones; self-supervised vision models at AFRL in 2024.',
    evidence: [
      { label: 'Backbone re-run', href: '#work-reject-option' },
      { label: 'AFRL 2024', href: `${base}experience/` },
    ],
  },
  {
    label: 'Engineering',
    items: ['Python', 'PyTorch', 'NumPy', 'Slurm', 'Singularity', 'uv', 'Git', 'Linux HPC'],
    proof: 'Own the full pipeline from data generation through training and evaluation at DCS, using Slurm in high-performance computing environments.',
    evidence: [{ label: 'DCS role', href: '#experience' }],
  },
];
