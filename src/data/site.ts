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
  jobTitle: 'PhD in Computer Science and Engineering',
  headline: 'I build models that know when not to answer.',
  institution: 'The Ohio State University',
  institutionUrl: 'https://www.osu.edu/',
  lab: 'Computer Vision Lab',
  advisor: 'Jim Davis',
  location: 'Columbus, Ohio, USA',
  email: 'kashanimotlagh.1@osu.edu',
  citizenship: 'U.S. citizen',
  availableFrom: '2026-08',
  availability: 'Available now',
  seeking: ['Research Scientist', 'Applied Scientist', 'Machine Learning Engineer'],
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
    question: 'What does Nick Kashani Motlagh work on?',
    answer:
      'Reliability of machine learning systems under uncertainty — specifically when a model should answer, weigh evidence, revise its answer, or abstain. The work spans selective prediction and reject-option classification for classifiers, evidence-use metrics for multimodal systems, and answer/refine/abstain policies for retrieval-augmented question answering with large language models.',
  },
  {
    question: 'Is he available for hire, and when?',
    answer:
      'Yes. He is available now for Research Scientist, Applied Scientist, and Machine Learning Engineer roles. He is based in Columbus, Ohio and is open to relocation or remote work.',
  },
  {
    question: 'What is his education?',
    answer:
      'A PhD in Computer Science and Engineering from The Ohio State University, conferred August 2026 (dissertation defended July 8, 2026), advised by Prof. Jim Davis, with graduate minors in Mathematics and High-Performance Computing. He also holds an M.S. (2025) and a B.S. with Honors (2021) in Computer Science and Engineering from Ohio State.',
  },
  {
    question: 'What has he published?',
    answer:
      'Four peer-reviewed first-author papers: “Naturally Constrained Reject Option Classification” (Machine Vision and Applications, 2025), “Assessing the Role of Imagery in Multimodal Machine Translation” (WMT 2024), “Learning When to Say I Don’t Know” (ISVC 2022, Springer Best Paper Award), and “A Framework for Semi-automatic Collection of Temporal Satellite Imagery” (ICCV Workshop 2021). A fifth manuscript, on retrieval-augmented selective QA, is under review and not yet accepted.',
  },
  {
    question: 'Has he won any awards?',
    answer:
      'Yes — the Springer Best Paper Award at ISVC 2022 for “Learning When to Say I Don’t Know,” the reject-option classification work later extended into the Machine Vision and Applications journal version.',
  },
  {
    question: 'What is his engineering experience, as opposed to research output?',
    answer:
      'He writes the training code, the evaluation harnesses, and the cluster orchestration himself. Recent work includes LoRA fine-tuning of answer/refine/abstain controllers on 8× NVIDIA H200 GPUs (roughly 400 GPU-hours for a clean reproduction) and a paired-outcome evaluation harness over 25,870 held-out questions. Day-to-day stack: Python, PyTorch, Hugging Face, FAISS, Slurm, and Singularity.',
  },
  {
    question: 'Can he work on U.S. federal or defense contracts?',
    answer:
      'Yes. He is a U.S. citizen and has completed five summers of AFRL-sponsored research, and currently works as a Technical Analyst II at DCS Corp on AFRL-sponsored LLM reliability work. Federal and cleared-adjacent roles are welcome.',
  },
  {
    question: 'How should someone contact him?',
    answer: `By email at ${person.email}. His CV is at ${SITE_URL}/resume.pdf, code at ${links.github}, and publication record at ${links.scholar} and ORCID ${links.orcid}.`,
  },
];
