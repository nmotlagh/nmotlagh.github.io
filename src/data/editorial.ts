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
    eyebrow: "Research Scientist / Applied Scientist · LLM evaluation & reliability",
    availability: {
      label: "Available August 2026",
      detail:
        "Research Scientist, Applied Scientist & ML Engineer roles · LLM evaluation, abstention, safety · Columbus, OH; open to relocation / remote",
    },
    title: "Nick Kashani Motlagh",
    lede: "I build models that know when not to answer.",
    supporting:
      "PhD candidate at Ohio State's Computer Vision Lab, defending August 2026. My dissertation, <em>Answering Under Uncertainty</em>, studies the three places direct answering breaks down: when a prediction is unreliable (abstention), when an input is ambiguous relative to available evidence (evidence use), and when a draft answer should get a second look before it is returned (revision).",
    status:
      "Current ARR manuscript: when should a QA system trust its draft answer, revise it with retrieved evidence, or decline to answer? Title and details withheld during anonymous review.",
  },
  dissertation: {
    eyebrow: "PhD dissertation · defending August 2026",
    title: "Answering Under Uncertainty",
    subtitle: "Abstention, Ambiguity, and Revision",
    summary:
      "The dissertation addresses three places where answering breaks down: unreliable output confidence, input ambiguity relative to available evidence, and uncertainty about whether revising a draft answer with retrieved evidence will make it better or worse.",
  },
  currentWork: {
    eyebrow: "Current manuscript",
    title: "Retrieval-augmented selective QA — title withheld for review",
    body:
      "An ARR submission on retrieval-augmented selective QA. The work measures when revising a draft answer with retrieved evidence makes it better and when it makes it worse, then uses those measurements to decide whether the system should answer, revise, or abstain instead of relying on confidence alone.",
    venue: "ARR submission in preparation",
    disclaimer:
      "No acceptance is claimed here. The working title and manuscript details are withheld to preserve anonymous review.",
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
    "PhD, The Ohio State University — defending August 2026",
    "Research Scientist / Applied Scientist / ML Engineer · selective prediction, calibration, LLM evaluation",
    "First author on 4 published papers · 1 manuscript in preparation · ISVC 2022 Best Paper",
    "Current ARR manuscript on retrieval-augmented selective QA · title withheld for review",
    "Python · PyTorch · HuggingFace · Slurm/Singularity · RAG evaluation",
    "U.S. citizen · five summers cleared work · Columbus OH, open to relocation / remote",
  ],
};

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
    evidence: "ISVC 2022 Best Paper · MVA 2025 journal extension",
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
    actionLabel: "Revise",
    failurePoint: "Post-answer revision",
    question: "Will a second look make the answer better or worse?",
    title: "When revision helps",
    description:
      "Compares a model's direct answer with its evidence-revised answer on the same questions, so routing policies can weigh the chance that revision fixes a wrong answer against the chance it breaks a right one.",
    evidence: "ARR submission in preparation",
    publicationSlug: "adaptive-qa-abstention",
  },
];

export const researchArc: ResearchArcStep[] = [
  {
    label: "2021–24",
    title: "Selective prediction for vision",
    description:
      "Class-conditional reject thresholds for image classifiers, estimated from validation statistics and evaluated with coverage/selective-accuracy tradeoffs.",
    evidence: "ISVC 2022 Best Paper; MVA 2025 journal extension.",
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
      "Evaluates when evidence-based revision improves a draft answer and when it degrades one, driving answer / revise / abstain decisions for retrieval-augmented QA.",
    evidence: "ARR submission package in preparation.",
  },
];
