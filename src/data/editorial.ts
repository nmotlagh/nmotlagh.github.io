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
      "Fifth-year PhD candidate advised by Jim Davis. My work started in selective prediction for image classifiers, moved into multimodal machine translation, and now centers on adaptive question answering with LLMs. Defending in 2026.",
    status:
      "Looking for research scientist and applied ML roles starting summer 2026.",
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
    "PhD candidate, The Ohio State University",
    "Defending in 2026",
    "Research focus: selective prediction, abstention, LLM adaptive QA",
    "U.S. citizen with experience on CUI and DoD-adjacent work",
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
