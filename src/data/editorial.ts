import { person } from './site';

export const homeEditorial = {
  hero: {
    eyebrow: 'Machine learning · Research & engineering',
    title: person.name,
    ledeHtml: 'I build and evaluate <em>reliable ML systems.</em>',
    supporting:
      'PhD in Computer Science and Engineering from Ohio State. I study when models should answer, use more evidence, or abstain, and build the training code and evaluation tools to test those decisions.',
  },
  research: {
    eyebrow: 'Selected research',
    title: 'When should a model answer?',
    summary: 'My work connects selective prediction, multimodal evaluation, and retrieval-augmented language models.',
  },
  featuredArtifactIds: ['learning-idk', 'calibration', 'construction-site-satellite-imagery'],
};

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  { label: 'Build', items: ['Python', 'PyTorch', 'Hugging Face', 'scikit-learn', 'FAISS'] },
  { label: 'Run', items: ['Slurm', 'Singularity', 'Multi-GPU experiments', 'LoRA fine-tuning'] },
  { label: 'Evaluate', items: ['LLM evaluation', 'Selective prediction', 'Calibration', 'Multimodal systems'] },
];

export interface ResearchResult {
  index: string;
  title: string;
  summary: string;
  contribution: string;
  venue: string;
  publicationSlug: string;
  linkLabel: string;
}

export const researchResults: ResearchResult[] = [
  {
    index: '01',
    title: 'Learning to abstain',
    summary: 'A classifier should be able to withhold an unreliable prediction.',
    contribution: 'Developed per-class rejection thresholds learned from validation data, without a user-defined rejection cost. Released the implementation and calibration tools.',
    venue: 'ISVC 2022 · MVA 2025',
    publicationSlug: 'learning-when-to-say-i-dont-know',
    linkLabel: 'Paper & code',
  },
  {
    index: '02',
    title: 'Testing evidence use',
    summary: 'Does a multimodal model actually use the image it receives?',
    contribution: 'Designed ImageCoMMuTE metrics that swap visual evidence to distinguish image understanding from its effect on a translation decision.',
    venue: 'WMT 2024',
    publicationSlug: 'assessing-imagery-in-multimodal-mt',
    linkLabel: 'Read the paper',
  },
  {
    index: '03',
    title: 'Evaluating answer revision',
    summary: 'A second pass can repair a mistake or damage a correct answer.',
    contribution: 'Built paired-outcome evaluations for retrieval-augmented QA and studied policies that choose whether to answer, refine, or abstain.',
    venue: 'Dissertation research · Unpublished',
    publicationSlug: 'adaptive-qa-abstention',
    linkLabel: 'Research overview',
  },
];
