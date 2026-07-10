export interface ResearchArcStep {
  label: string;
  title: string;
  description: string;
  evidence: string;
}

export interface DissertationPillar {
  index: string;
  action: "abstain" | "answer" | "refine";
  actionLabel: string;
  failurePoint: string;
  question: string;
  title: string;
  description: string;
  evidence: string;
  publicationSlug?: string;
}

export const homeEditorial = {
  hero: {
    eyebrow: "Seeking Research Scientist / Applied Scientist roles · LLM evaluation & reliability",
    availability: {
      label: "Available August 2026",
      detail:
        "Research Scientist, Applied Scientist & ML Engineer roles · U.S. citizen with five summers of AFRL research experience · Columbus, OH; open to relocation / remote",
    },
    title: "Nick Kashani Motlagh",
    lede: "I build models that know when not to answer.",
    supporting:
      "PhD candidate at Ohio State's Computer Vision Lab. I successfully defended my dissertation on July 8, 2026, with the degree expected in August. <em>Answering Under Uncertainty</em> studies three points where directly returning a model's current best answer may not be justified: abstention from an unreliable prediction, evidence use under ambiguity, and whether refining a draft is more likely to repair it than harm it.",
    status:
      "Current work: when should a QA system trust its draft answer, refine it with retrieved evidence, or abstain? The manuscript is under review at ACL Rolling Review; its title and author list remain withheld during review.",
  },
  dissertation: {
    eyebrow: "PhD dissertation · successfully defended July 8, 2026",
    title: "Answering Under Uncertainty",
    subtitle: "Abstention, Ambiguity, and Recoverability",
    summary:
      "The dissertation asks what an AI system should measure when direct return is not yet justified: whether to withhold an unreliable output, whether available evidence supports an intended interpretation, and whether refining a draft is more likely to repair it than harm it.",
  },
  currentWork: {
    eyebrow: "Manuscript under review",
    title: "Selective RAG-QA: answer, refine, or abstain",
    body:
      "This work compares direct and evidence-refined answers in retrieval-augmented QA, separating preserved, repaired, harmed, and unrecovered outcomes. It then evaluates answer, refine, or abstain policies without treating draft confidence as a complete estimate of recoverability. Results are reported for a fixed stack on NQ-Open, TriviaQA, and PopQA.",
    venue: "Under review at ACL Rolling Review",
    disclaimer:
      "The submission title, author list, and preprint remain withheld during double-blind review.",
  },
  featuredPublicationSlugs: [
    "adaptive-qa-abstention",
    "learning-when-to-say-i-dont-know",
    "naturally-constrained-reject-option-classification",
    "assessing-imagery-in-multimodal-mt",
  ],
  featuredArtifactIds: [
    "learning-idk",
    "calibration",
    "construction-site-satellite-imagery",
  ],
  recruiterFacts: [
    "PhD candidate, The Ohio State University · dissertation defended July 8, 2026 · degree expected August 2026",
    "Research Scientist / Applied Scientist / ML Engineer · selective prediction, calibration, LLM evaluation",
    "First author on 4 published papers · 1 manuscript under review · Springer Best Paper Award at ISVC 2022",
    "Current manuscript on retrieval-augmented selective QA · under review at ACL Rolling Review",
    "Python · PyTorch · Hugging Face · Slurm/Singularity · RAG evaluation",
    "U.S. citizen · five summers of AFRL research experience · Columbus OH, open to relocation / remote",
  ],
};

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages & ML",
    items: ["Python", "PyTorch", "Hugging Face", "NumPy", "scikit-learn"],
  },
  {
    label: "Systems & scale",
    items: ["Slurm", "Singularity", "Distributed training", "GPU clusters", "Git"],
  },
  {
    label: "Research areas",
    items: [
      "LLM evaluation",
      "Retrieval-augmented generation",
      "Selective prediction",
      "Calibration",
      "Uncertainty quantification",
      "Abstention",
      "Multimodal systems",
    ],
  },
];

export const dissertationPillars: DissertationPillar[] = [
  {
    index: "01",
    action: "abstain",
    actionLabel: "Abstain",
    failurePoint: "Output uncertainty",
    question: "Is the current prediction reliable enough to return?",
    title: "Natural reject option",
    description:
      "Abstention when no rejection cost or coverage target is given: per-class thresholds that maximize selected accuracy while requiring the rejected region to behave like genuine confusion.",
    evidence: "Springer Best Paper Award at ISVC 2022 · MVA 2025 journal extension",
    publicationSlug: "learning-when-to-say-i-dont-know",
  },
  {
    index: "02",
    action: "answer",
    actionLabel: "Use evidence",
    failurePoint: "Input ambiguity",
    question: "Does available evidence move the model toward the intended meaning?",
    title: "Measuring evidence use",
    description:
      "ImageCoMMuTE-style metrics for multimodal translation: does the correct image lower the model's uncertainty for the correct translation, relative to a misleading image? The metrics test image dependence directly instead of inferring it from aggregate scores.",
    evidence: "WMT 2024",
    publicationSlug: "assessing-imagery-in-multimodal-mt",
  },
  {
    index: "03",
    action: "refine",
    actionLabel: "Refine",
    failurePoint: "Post-answer recoverability",
    question: "Will a second look make the answer better or worse?",
    title: "Measuring recoverability",
    description:
      "Compares direct and evidence-refined answers on the same questions, distinguishing preserved, repaired, harmed, and unrecovered outcomes for a fixed QA stack before evaluating answer, refine, or abstain policies.",
    evidence: "Manuscript under review at ACL Rolling Review",
    publicationSlug: "adaptive-qa-abstention",
  },
];

export const researchArc: ResearchArcStep[] = [
  {
    label: "2021–24",
    title: "Selective prediction for vision",
    description:
      "Class-conditional reject thresholds for image classifiers, estimated from validation statistics and evaluated with coverage/selective-accuracy tradeoffs.",
    evidence: "Springer Best Paper Award at ISVC 2022; MVA 2025 journal extension.",
  },
  {
    label: "2024",
    title: "Multimodal machine translation",
    description:
      "Contrastive evaluation for measuring whether multimodal MT systems use paired image evidence rather than benefiting only from image-conditioned training.",
    evidence: "WMT 2024.",
  },
  {
    label: "2025–26",
    title: "Selective QA with retrieval",
    description:
      "Evaluates when evidence-based refinement repairs a draft answer and when it harms one, supporting answer / refine / abstain decisions for a fixed retrieval-augmented QA stack.",
    evidence: "Manuscript under review at ACL Rolling Review.",
  },
];
