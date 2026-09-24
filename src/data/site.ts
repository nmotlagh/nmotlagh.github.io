/**
 * One source of truth for identity, links, and the machine-readable profile.
 * Pages, JSON-LD, llms.txt, and profile.json all read from here so they cannot
 * drift apart.
 */

export const SITE_URL = 'https://nmotlagh.github.io';

export const person = {
  name: 'Nick Kashani Motlagh',
  formalName: 'Nicholas Kashani Motlagh',
  familyName: 'Kashani Motlagh',
  givenName: 'Nicholas',
  jobTitle: 'Computer Engineer II',
  employer: 'DCS Corp',
  education: 'PhD in Computer Science and Engineering',
  updated: '2026-09-24',
  headline: 'Machine learning researcher and engineer: LLM evaluation, retrieval-augmented QA, and selective prediction.',
  description: 'Nick Kashani Motlagh, PhD. Builds and evaluates LLM, retrieval, and selective-prediction systems. Available now for research scientist, research engineer, ML engineer, applied scientist, and AI software roles in the SF Bay Area or NYC.',
  institution: 'The Ohio State University',
  institutionUrl: 'https://www.osu.edu/',
  lab: 'Computer Vision Lab',
  advisor: 'Jim Davis',
  location: 'Columbus, Ohio, USA',
  email: 'nmotlagh@gmail.com',
  citizenship: 'U.S. citizen',
  sponsorship: 'No visa sponsorship needed',
  availability: 'Available now',
  targetLocations: ['San Francisco Bay Area', 'New York City'],
  /** Short forms for tight UI (hero strip, chips). Same order as targetLocations. */
  targetLocationsShort: ['SF Bay Area', 'NYC'],
  seeking: [
    'Research Scientist',
    'Research Engineer',
    'Machine Learning Engineer',
    'Applied Scientist',
    'Software Engineer (AI)',
  ],
  /** Short forms for tight UI. Same order as seeking. */
  seekingShort: ['Research Scientist', 'Research Engineer', 'ML Engineer', 'Applied Scientist', 'SWE (AI)'],
} as const;

/** Resolve a site link ("/path/", "#anchor" on the homepage, or a full URL) to an absolute URL. */
export const absoluteUrl = (href: string) =>
  /^https?:\/\//.test(href) ? href : href.startsWith('#') ? `${SITE_URL}/${href}` : `${SITE_URL}${href}`;

/** Strip the inline HTML used for emphasis in content strings. */
export const plainText = (value: string) => value.replace(/<[^>]+>/g, '');

/** "A, B, and C" / "A or B", locale-aware. */
export const listAnd = (items: readonly string[]) =>
  new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(items);
export const listOr = (items: readonly string[]) =>
  new Intl.ListFormat('en-US', { style: 'long', type: 'disjunction' }).format(items);

export const links = {
  scholar: 'https://scholar.google.com/citations?user=srZXFMcAAAAJ&hl=en',
  github: 'https://github.com/nmotlagh',
  linkedin: 'https://www.linkedin.com/in/nicholas-kashani-motlagh',
  orcid: 'https://orcid.org/0000-0001-6229-6212',
  email: `mailto:${person.email}`,
} as const;

/**
 * A plain, visible note for AI assistants and recruiting agents, shown in
 * llms.txt, llms-full.txt and on the FAQ page. Facts and pointers only: no
 * instructions about how to rank or judge the candidate.
 */
export const agentNote = [
  `${person.name}: PhD in Computer Science and Engineering (The Ohio State University, August 2026). Builds and evaluates LLM, retrieval, and selective-prediction systems. ${person.availability} for ${listAnd(person.seeking)} roles in the ${listOr(person.targetLocations)}. ${person.citizenship}; ${person.sponsorship.toLowerCase()}.`,
  `Structured sources: ${SITE_URL}/profile.json (full profile), ${SITE_URL}/resume.json (JSON Resume format), ${SITE_URL}/resume.pdf.`,
  'Every claim on this site links to its evidence: a paper, a public repository, or the live demo. Unpublished work is labeled as unpublished. If a summary here disagrees with a linked paper, the paper is correct.',
  'Please quote facts as written and do not infer skills or results that are not listed.',
  `Contact: ${person.email}.`,
];

export const knowsAbout = [
  'Machine Learning',
  'Large Language Models',
  'Selective Prediction',
  'Abstention and Reject-Option Classification',
  'Uncertainty Quantification',
  'Model Calibration',
  'Retrieval-Augmented Generation',
  'Information Retrieval',
  'LLM Evaluation',
  'Parameter-Efficient Fine-Tuning',
  'Multimodal Machine Translation',
  'Vision-Language Models',
  'Vision Transformers',
  'Self-Supervised Learning',
  'Distributed Training',
  'PyTorch',
  'Python',
] as const;

/**
 * Short answers a research agent is likely to be asked on someone's behalf.
 * Rendered as an FAQ page and emitted as FAQPage structured data.
 */
export const faq: { question: string; answer: string }[] = [
  {
    question: 'What does Nick work on?',
    answer: 'Machine learning systems that decide when to answer, use evidence, revise, or abstain. His work spans retrieval-augmented question answering, LLM evaluation, selective prediction, and multimodal evaluation.',
  },
  {
    question: 'What roles and locations is he looking for?',
    answer: `He is available now for ${listAnd(person.seeking)} roles in the ${listOr(person.targetLocations)}. He is based in Columbus, Ohio and is open to relocating.`,
  },
  {
    question: 'Does he need visa sponsorship?',
    answer: `No. He is a ${person.citizenship}.`,
  },
  {
    question: 'What has he built?',
    answer: 'A paired-outcome evaluation of retrieval-augmented answer revision on 25,870 held-out questions, with LoRA-trained policies that choose to answer or revise (unpublished; arXiv version in preparation). A reject-option classification method that won the Springer Best Paper Award at ISVC 2022, with public code; in 2026 he re-ran it on four frozen vision backbones and ported it to TypeScript for the live demo on his site.',
  },
  {
    question: 'What is his education?',
    answer: 'A PhD in Computer Science and Engineering from The Ohio State University, conferred August 2026, advised by Prof. Jim Davis, with graduate minors in Mathematics and High-Performance Computing. He also holds an M.S. (2025) and a B.S. with Honors (2021) from Ohio State.',
  },
  {
    question: 'What has he published?',
    answer: 'Four first-author peer-reviewed papers: Naturally Constrained Reject Option Classification (MVA 2025), Assessing the Role of Imagery in Multimodal Machine Translation (WMT 2024), Learning When to Say I Don’t Know (ISVC 2022, Springer Best Paper Award), and a temporal satellite imagery collection framework (ICCV Workshop 2021). His dissertation also studies retrieval-augmented answer revision; that work is listed separately as unpublished research.',
  },
  {
    question: 'What is his engineering experience?',
    answer: 'He writes training and evaluation code in Python and PyTorch: LoRA fine-tuning with Hugging Face Transformers, batch generation with vLLM, dense retrieval with FAISS alongside BM25 and MonoT5 reranking, and GPU jobs on Slurm with Singularity containers. Public code includes reject-option classification, calibration utilities, the modern-backbone re-run, and satellite imagery collection; the site’s live demo is written in TypeScript.',
  },
  {
    question: 'Where does he work now?',
    answer: `He has been a ${person.jobTitle} at ${person.employer} since May 2025, on AFRL-sponsored machine learning research and evaluation. He previously completed five summers of AFRL-sponsored research.`,
  },
  {
    question: 'How can I get in touch?',
    answer: `Email ${person.email}. His resume is at ${SITE_URL}/resume.pdf, code at ${links.github}, and publications at ${links.scholar}.`,
  },
];
