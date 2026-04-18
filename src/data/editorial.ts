export interface ResearchArcStep {
  label: string;
  title: string;
  description: string;
  evidence: string;
}

export const homeEditorial = {
  hero: {
    eyebrow: "PhD candidate · Ohio State Computer Vision Lab",
    title: "Nick Kashani Motlagh",
    lede:
      "I work on machine learning systems that decide when to answer, when to retrieve, and when to abstain.",
    supporting:
      "Fifth-year PhD candidate advised by Jim Davis. My work spans selective prediction for vision (ISVC 2022 Best Paper, MVA 2025 journal extension), multimodal machine translation (WMT 2024), and adaptive question answering with LLMs (EMNLP 2026 submission). Five summers as a researcher at AFRL on CUI work. Graduating August 2026.",
    status:
      "Available fall 2026 for research scientist and applied ML engineering roles. U.S. citizen.",
  },
  currentWork: {
    eyebrow: "Current paper",
    title: "Reject or Refine? Separating retrievable from unrecoverable uncertainty in adaptive QA.",
    body:
      "When an LLM-based QA system shouldn't answer directly, is the signal that says \"retrieve\" the same signal that says \"abstain\"? In a fixed model–retriever–corpus stack, the answer is no. Cheap answer confidence is near chance for recoverability once the direct branch fails; retriever-side scalars improve AUC but collapse at usable operating points; a class-weighted question-only controller is the one thing that actually learns genuine 3-way routing.",
    venue: "Under review at EMNLP 2026.",
  },
  featuredPublicationSlugs: [
    "reject-or-refine",
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
    "Available fall 2026",
    "ISVC 2022 Best Paper · selective prediction, abstention, adaptive QA",
    "U.S. citizen · five summers of AFRL CUI experience",
  ],
};

export const researchArc: ResearchArcStep[] = [
  {
    label: "2021–24",
    title: "Selective prediction for vision",
    description:
      "Per-class reject thresholds that let image classifiers back out of ambiguous regions instead of forcing a guess.",
    evidence: "ISVC 2022 Best Paper; MVA 2025 journal extension.",
  },
  {
    label: "2024",
    title: "Multimodal machine translation",
    description:
      "Measured whether state-of-the-art multimodal MT systems actually use visual evidence, or treat images as a regularizer.",
    evidence: "WMT 2024.",
  },
  {
    label: "2025–26",
    title: "Reject or refine for LLM QA",
    description:
      "Once the direct answer looks unreliable, can retrieval rescue the question or should the model abstain? A class-weighted controller can separate the two; confidence alone cannot.",
    evidence: "EMNLP 2026 submission, under review.",
  },
];
