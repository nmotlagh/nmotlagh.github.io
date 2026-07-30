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
    eyebrow: "Ph.D. in Computer Science | Applied ML Researcher at DCS Corp",
    availability: {
      label: "Technical Analyst II · DCS Corp",
      detail:
        "Applied ML research and evaluation · Ph.D. requirements completed at Ohio State · degree conferral scheduled August 9, 2026",
    },
    title: "Nick Kashani Motlagh",
    lede: "I build models that know when not to answer.",
    supporting:
      "I completed the requirements for a Ph.D. in Computer Science at The Ohio State University after successfully defending my dissertation on July 8, 2026; formal degree conferral is scheduled for August 9. <em>Answering Under Uncertainty</em> studies three points where directly returning a model's current best answer may not be justified: abstention from an unreliable prediction, evidence use under ambiguity, and whether refining a draft is more likely to repair it than harm it.",
    status:
      "Current work: when does retrieval-conditioned revision repair a short-form QA answer, and when does it harm one? An anonymous manuscript is being prepared for ACL Rolling Review resubmission; review-sensitive details remain withheld.",
  },
  dissertation: {
    eyebrow: "Ph.D. completed · defended July 8, 2026 · conferral August 9, 2026",
    title: "Answering Under Uncertainty",
    subtitle: "Abstention, Ambiguity, and Recoverability",
    summary:
      "The dissertation asks what an AI system should measure when direct return is not yet justified: whether to withhold an unreliable output, whether available evidence supports an intended interpretation, and whether refining a draft is more likely to repair it than harm it.",
  },
  currentWork: {
    eyebrow: "Anonymous manuscript · preparing for ARR resubmission",
    title: "Recoverability in retrieval-augmented QA",
    body:
      "This work studies whether to return an observed QA draft or revise it using retrieved evidence. It treats the value of revision as a property of the draft and the proposed intervention, distinct from draft confidence alone. The evaluation is intentionally bounded to short-form open-domain QA with one recorded model-retriever-corpus stack; it does not establish generality to long-form, multi-hop, or domain-specific QA.",
    venue: "In preparation for ACL Rolling Review resubmission",
    disclaimer:
      "The submission title, author list, numerical results, and preprint remain withheld during anonymous review.",
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
    "Ph.D. requirements completed, The Ohio State University · defended July 8, 2026 · conferral scheduled August 9, 2026",
    "Technical Analyst II, DCS Corp · applied ML research and evaluation",
    "First author on 4 published papers · 1 anonymous manuscript in preparation · Springer Best Paper Award at ISVC 2022",
    "Current research on recoverability in retrieval-augmented QA · preparing for ARR resubmission",
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
    evidence: "Anonymous manuscript in preparation for ACL Rolling Review resubmission",
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
      "Studies when retrieval-conditioned revision repairs a draft answer and when it harms one, and whether that intervention-conditioned value can guide return / revise decisions for a fixed retrieval-augmented QA stack.",
    evidence: "Anonymous manuscript in preparation for ACL Rolling Review resubmission.",
  },
];
