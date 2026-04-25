export interface ResearchArcStep {
  label: string;
  title: string;
  description: string;
  evidence: string;
}

export const homeEditorial = {
  hero: {
    eyebrow: "Applied Scientist / ML Engineer · available August 2026",
    availability: {
      label: "Available August 2026",
      detail:
        "Applied Scientist & ML Engineer roles · LLM evaluation, abstention, safety · Columbus, OH; open to relocation / remote",
    },
    title: "Nick Kashani Motlagh",
    lede:
      "I work on selective prediction, calibration, and abstention policies for ML systems.",
    supporting:
      "PhD candidate at Ohio State’s Computer Vision Lab, graduating August 2026. My research studies when fixed model pipelines should predict, defer to retrieval, or abstain, with work spanning per-class reject thresholds, multimodal MT evaluation, and lightweight controllers for adaptive QA.",
    status:
      "Graduating August 2026 · applied scientist and ML engineer roles · LLM eval, abstention, safety.",
  },
  currentWork: {
    eyebrow: "EMNLP 2026 under review · adaptive QA · LLM abstention",
    title: "Reject or Refine? Separating retrievable from unrecoverable uncertainty in adaptive QA.",
    body:
      "This paper studies the retrieve-versus-abstain decision after direct answering has already been ruled out. In a fixed model–retriever–corpus stack, answer confidence is a poor proxy for recoverability: logprob baselines reach only .518–.553 Recoverability AUC and have Reject Recall = 0. A class-weighted question-only controller reaches .678 ± .005 AUC with .487 ± .059 Reject Recall over 41,145 examples, and improves Refine Recall over cumulative-logprob by +.252 [.233, .272] at matched coverage.",
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
    "Applied Scientist / ML Engineer · selective prediction, calibration, LLM evaluation",
    "First author on 5 publications · ISVC 2022 Best Paper",
    "8× OOD utility gain in abstention-augmented LLM experiments (DCS Corp / AFRL)",
    "Python · PyTorch · HuggingFace · Slurm/Singularity · RAG evaluation",
    "U.S. citizen · five summers cleared work · Columbus OH, open to relocation / remote",
  ],
};

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
    title: "Reject or refine for LLM QA",
    description:
      "Three-way routing for QA pipelines: direct answer, retrieve-then-answer, or abstain, with recoverability estimated separately from answer confidence.",
    evidence: "EMNLP 2026 submission, under review.",
  },
];
