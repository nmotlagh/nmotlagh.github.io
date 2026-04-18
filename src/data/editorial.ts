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
      "I build machine learning systems that know when to answer, when to retrieve, and when to refuse.",
    supporting:
      "First-author on all five of my publications: selective prediction for vision (ISVC 2022 Best Paper, MVA 2025 journal extension), multimodal machine translation (WMT 2024), and adaptive question answering with LLMs (EMNLP 2026 submission). Five summers at AFRL on CUI work. Python, PyTorch, transformers, retrieval-augmented generation, evaluation harnesses, distributed training on HPC.",
    status:
      "Graduating August 2026. Available fall 2026 for applied ML and ML engineering roles. Columbus, OH — open to relocation and remote. U.S. citizen.",
  },
  currentWork: {
    eyebrow: "EMNLP 2026 under review · adaptive QA · LLM abstention",
    title: "Reject or Refine? When LLM agents should retrieve, reason, or refuse.",
    body:
      "When an LLM-based QA system shouldn't answer directly, is the signal that says \"retrieve\" the same signal that says \"abstain\"? In a fixed model–retriever–corpus stack, the answer is no. Over 41k eval instances, a small class-weighted question-only controller reaches Recoverability AUC .678 ± .005 with Reject Recall .487 ± .059; cheap logprob baselines top out at AUC ≈ .55 and never reject (Reject Recall = 0). At matched coverage, the controller's Refine Recall advantage over cumulative-logprob is +.252 [.233, .272].",
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
    "PhD, The Ohio State University — graduating August 2026",
    "Available fall 2026 · applied ML / ML engineering",
    "First author on 5/5 publications · ISVC 2022 Best Paper",
    "Python, PyTorch, transformers, RAG, distributed training",
    "Five summers at AFRL · U.S. citizen · Columbus, OH (open to relocation / remote)",
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
