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
  updated: '2026-10-05',
  headline: 'Machine learning researcher and engineer: computer vision and natural language processing.',
  description: 'Nick Kashani Motlagh, PhD. Develops machine learning methods for computer vision and natural language processing. Available now for research scientist, research engineer, ML engineer, applied scientist, and AI software roles. Open to relocating.',
  institution: 'The Ohio State University',
  institutionUrl: 'https://www.osu.edu/',
  lab: 'Computer Vision Lab',
  advisor: 'Jim Davis',
  location: 'Columbus, Ohio, USA',
  email: 'nmotlagh@gmail.com',
  citizenship: 'U.S. citizen',
  sponsorship: 'No visa sponsorship needed',
  availability: 'Available now',
  relocation: 'Open to relocating',
  /** No preferred destinations; relocation is open. */
  targetLocations: [],
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

/** "A, B, and C", locale-aware. */
export const listAnd = (items: readonly string[]) =>
  new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(items);

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
  `${person.name}: PhD in Computer Science and Engineering (The Ohio State University, August 2026). Develops machine learning methods for computer vision and natural language processing. ${person.availability} for ${listAnd(person.seeking)} roles. ${person.relocation}. ${person.citizenship}; ${person.sponsorship.toLowerCase()}.`,
  `Structured sources: ${SITE_URL}/profile.json (full profile), ${SITE_URL}/resume.json (JSON Resume format), ${SITE_URL}/resume.pdf.`,
  'Research summaries link to papers, public repositories, and the live demo. Preprints and unpublished work are labeled separately from peer-reviewed papers. If a summary here disagrees with a linked paper, the paper is correct.',
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
    answer: 'His research connects abstention, ambiguity, and recoverability across computer vision and natural language processing. His current work includes synthetic question-answer datasets and QA model training and evaluation.',
  },
  {
    question: 'What roles and locations is he looking for?',
    answer: `He is available now for ${listAnd(person.seeking)} roles. ${person.relocation}. He is based in Columbus, Ohio.`,
  },
  {
    question: 'Does he need visa sponsorship?',
    answer: `No. He is a ${person.citizenship}.`,
  },
  {
    question: 'What has he built?',
    answer: 'A paired-outcome evaluation of retrieval-augmented answer revision on 25,870 held-out questions, with fine-tuned return-or-revise policies (public arXiv preprint v1, September 24, 2026; not peer-reviewed). A reject-option classification method that won the Springer Best Paper Award at ISVC 2022, with public code; in 2026 he re-ran it on four frozen vision backbones and the site includes an interactive demo of the rule.',
  },
  {
    question: 'What is his education?',
    answer: 'A PhD in Computer Science and Engineering from The Ohio State University, conferred August 2026, advised by Prof. Jim Davis, with graduate minors in Mathematics and High-Performance Computing. He also holds an M.S. (2025) and a B.S. with Honors (2021) from Ohio State.',
  },
  {
    question: 'What has he published?',
    answer: 'Four first-author peer-reviewed papers: Naturally Constrained Reject Option Classification (MVA 2025), Assessing the Role of Imagery in Multimodal Machine Translation (WMT 2024), Learning When to Say I Don’t Know (ISVC 2022, Springer Best Paper Award), and a temporal satellite imagery collection framework (ICCV Workshop 2021). Return or Revise? Learning When Revision Helps Retrieval-Augmented QA is listed separately as a public arXiv preprint (v1, September 24, 2026), not a peer-reviewed paper.',
  },
  {
    question: 'What is his engineering experience?',
    answer: 'He writes training and evaluation code in Python and PyTorch: LoRA fine-tuning with Hugging Face Transformers, batch generation with vLLM, dense retrieval with FAISS alongside BM25 and MonoT5 reranking, and GPU jobs on Slurm with Singularity containers. Public code includes reject-option classification, calibration utilities, the modern-backbone re-run, and satellite imagery collection.',
  },
  {
    question: 'Where does he work now?',
    answer: `He has been a ${person.jobTitle} at ${person.employer} since May 2025, supporting the Air Force Research Laboratory. He develops synthetic question-answer datasets from domain-specific documents and trains QA models, owning the full pipeline from data generation through training and evaluation using Slurm in high-performance computing environments. He previously completed five summers of AFRL-sponsored research.`,
  },
  {
    question: 'How can I get in touch?',
    answer: `Email ${person.email}. His resume is at ${SITE_URL}/resume.pdf, code at ${links.github}, and publications at ${links.scholar}.`,
  },
];
