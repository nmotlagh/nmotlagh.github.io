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
  updated: '2026-09-04',
  headline: 'I build and evaluate reliable ML systems.',
  description: 'Nick Kashani Motlagh, PhD. Machine learning research and engineering in LLM evaluation, selective prediction, and multimodal systems. Open to roles in California and New York City.',
  institution: 'The Ohio State University',
  institutionUrl: 'https://www.osu.edu/',
  lab: 'Computer Vision Lab',
  advisor: 'Jim Davis',
  location: 'Columbus, Ohio, USA',
  email: 'nmotlagh@gmail.com',
  citizenship: 'U.S. citizen',
  availability: 'Open to opportunities',
  targetLocations: ['California', 'New York City'],
  seeking: ['Research Engineer', 'Machine Learning Engineer', 'Software Engineer, Machine Learning', 'Applied Scientist'],
} as const;

export const links = {
  scholar: 'https://scholar.google.com/citations?user=srZXFMcAAAAJ&hl=en',
  github: 'https://github.com/nmotlagh',
  linkedin: 'https://www.linkedin.com/in/nicholas-kashani-motlagh',
  orcid: 'https://orcid.org/0000-0001-6229-6212',
  email: `mailto:${person.email}`,
} as const;

export const knowsAbout = [
  'Machine Learning',
  'Large Language Models',
  'Selective Prediction',
  'Abstention and Reject-Option Classification',
  'Uncertainty Quantification',
  'Model Calibration',
  'Retrieval-Augmented Generation',
  'LLM Evaluation',
  'Multimodal Machine Translation',
  'Vision-Language Models',
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
    answer: 'Machine learning reliability: deciding when to answer, use evidence, revise, or abstain. His work spans selective prediction, multimodal evaluation, and retrieval-augmented question answering.',
  },
  {
    question: 'What roles and locations is he interested in?',
    answer: `He is exploring ${person.seeking.join(', ')} roles, especially teams building LLM evaluation tools, retrieval systems, and reliable ML products. He is based in Columbus, Ohio and is open to relocating to ${person.targetLocations.join(' or ')}.`,
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
    answer: 'He builds training and evaluation code in Python and PyTorch, works with Hugging Face models and LoRA fine-tuning, and runs experiments with Slurm and Singularity. Public code includes reject-option classification, calibration utilities, and satellite imagery collection.',
  },
  {
    question: 'Where does he work now?',
    answer: `He is a ${person.jobTitle} at ${person.employer}, working on machine learning research and evaluation. He previously completed five summers of AFRL-sponsored research and is a U.S. citizen.`,
  },
  {
    question: 'How can I get in touch?',
    answer: `Email ${person.email}. His resume is at ${SITE_URL}/resume.pdf, code at ${links.github}, and publications at ${links.scholar}.`,
  },
];
