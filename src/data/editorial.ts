export interface ChartBar {
  label: string;
  value: number;
  display: string;
}

export interface ResultChart {
  /** Upper bound of the shared track, in the same units as `value`. */
  max: number;
  axisLabel: string;
  bars: ChartBar[];
  caption: string;
}

export interface ResearchResult {
  index: string;
  action: "abstain" | "answer" | "refine";
  actionLabel: string;
  question: string;
  title: string;
  problem: string;
  built: string;
  headline: string;
  headlineLabel: string;
  /** Omitted for work that should not carry the same visual weight as a
      peer-reviewed result — the headline figure still shows. */
  chart?: ResultChart;
  detail: string;
  venue: string;
  publicationSlug?: string;
}

export const homeEditorial = {
  hero: {
    eyebrow: "LLM reliability · Selective prediction · Evaluation",
    availability: {
      label: "Available now",
      detail:
        "Research Scientist, Applied Scientist and ML Engineer roles · Columbus, OH — open to relocation or remote",
    },
    title: "Nick Kashani Motlagh",
    ledeHtml: "I build models that know <em>when not to answer.</em>",
    supporting:
      "PhD from Ohio State's Computer Vision Lab, advised by Jim Davis. I work on when a system should answer, weigh evidence, revise, or stay quiet — writing the training code in PyTorch, the evaluation harnesses around it, and the distributed runs on Slurm that produce the numbers below.",
  },
  research: {
    eyebrow: "Research · three results",
    title: "Answering Under Uncertainty",
    subtitle: "Abstention, Ambiguity, and Recoverability",
    summary:
      "Every model ships with a confidence signal, and every one of them answers a slightly different question than the one the next decision depends on. Three studies, three places that gap bites.",
    meta: [
      { label: "Where it ran", value: "4 vision, 3 text and 8 synthetic datasets; 25,870 held-out questions" },
      { label: "Peer review", value: "ISVC · MVA · WMT · ICCVW" },
      { label: "Code", value: "Public for the reject-option and calibration work" },
    ],
  },
  featuredArtifactIds: [
    "learning-idk",
    "calibration",
    "construction-site-satellite-imagery",
  ],
  recruiterFacts: [
    "PhD, The Ohio State University — conferred August 2026",
    "4 first-author peer-reviewed papers · Springer Best Paper Award, ISVC 2022",
    "Python · PyTorch · Hugging Face · Slurm · Singularity · FAISS · LoRA fine-tuning",
    "Largest study: 25,870 held-out questions, ~400 H200-GPU-hours, 8× H200 training",
    "U.S. citizen · five summers of AFRL-sponsored research · federal roles welcome",
  ],
};

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Build",
    items: ["Python", "PyTorch", "Hugging Face", "scikit-learn", "FAISS"],
  },
  {
    label: "Run",
    items: ["Slurm", "Singularity", "Multi-GPU training", "LoRA fine-tuning"],
  },
  {
    label: "Study",
    items: [
      "LLM evaluation",
      "Retrieval-augmented generation",
      "Selective prediction",
      "Calibration",
      "Multimodal systems",
    ],
  },
];

export const researchResults: ResearchResult[] = [
  {
    index: "01",
    action: "abstain",
    actionLabel: "Abstain",
    question: "Should it answer at all?",
    title: "Abstention without a budget",
    problem:
      "A classifier names a class for every input, including the ones it is plainly confused by. The standard fix — threshold the softmax — needs a rejection cost or coverage target that real deployments rarely have. On binary problems it rejects nothing at all, since one of two softmax scores is always at least 0.5.",
    built:
      "B-CDF learns per-class abstention thresholds from a validation set, post-hoc, with no retraining. The constraint is inverted: rather than targeting accuracy on what the model keeps, it requires the rejected set to look like a coin flip — so a model cannot inflate its score by quietly discarding answers it had right.",
    headline: "88.3% → 97.8%",
    headlineLabel: "CIFAR-100 selective accuracy, at 77.3% coverage",
    chart: {
      max: 15,
      axisLabel: "mistakes per 100 predictions",
      bars: [
        { label: "Answering everything", value: 11.7, display: "11.7" },
        { label: "Answering only what it keeps", value: 2.2, display: "2.2" },
      ],
      caption: "The same result read as errors, after abstaining on 22.7% of inputs.",
    },
    detail:
      "ImageNet moves 88.4% → 97.4% at 79.7% coverage. Verified across four vision benchmarks, three text benchmarks and eight synthetic datasets, from 2 to 1,000 classes.",
    venue: "Springer Best Paper Award, ISVC 2022 · extended in Machine Vision and Applications, 2025",
    publicationSlug: "learning-when-to-say-i-dont-know",
  },
  {
    index: "02",
    action: "answer",
    actionLabel: "Weigh evidence",
    question: "Is it really using the evidence?",
    title: "Measuring whether the image mattered",
    problem:
      "Multimodal translation systems get an image to resolve an ambiguous sentence — “that's lots of bucks” is about deer or about dollars. But a model that always guesses “dollars” still scores about 50%, so the benchmarks could not separate genuine evidence use from a lucky prior. The field largely concluded that images do not help.",
    built:
      "ImageCoMMuTE holds the translation fixed and swaps the image, then asks whether the correct image lowers the model's perplexity for the correct translation. That is an intervention on the evidence channel rather than an inference from aggregate scores. Group variants give credit only when a model resolves both readings of the same ambiguity.",
    headline: "81% vs. 63%",
    headlineLabel: "how often VGAMT reads the image correctly, vs. how often that changes its translation",
    chart: {
      max: 100,
      axisLabel: "% of ambiguous sentences",
      bars: [
        { label: "Reads the image correctly", value: 81, display: "81%" },
        { label: "…and changes the translation", value: 63, display: "63%" },
      ],
      caption: "VGAMT, English→French. Give it a perfect image and the gap widens: 92% vs. 34%.",
    },
    detail:
      "Hand the model a perfect image and evidence use climbs to 92%, while translation accuracy barely moves — 26% → 34%. The images were working; the text prior was overriding them. A fusion problem, not an image problem, and aggregate BLEU hides it entirely.",
    venue: "WMT 2024",
    publicationSlug: "assessing-imagery-in-multimodal-mt",
  },
  {
    index: "03",
    action: "refine",
    actionLabel: "Refine",
    question: "Will a second pass help or hurt?",
    title: "When retrieval makes the answer worse",
    problem:
      "RAG systems revise their own draft answers and average accuracy goes up, so refinement looks free. The average hides the trade: the same retrieval step that repairs one answer silently overwrites another that was already correct.",
    built:
      "Score both branches for every question and label each outcome preserved, repaired, harmed, or unrecovered — the value of refining is then exactly repair minus harm. A two-head policy routes each question to answer, refine, or abstain.",
    headline: "repairs 10.8%, harms 8.1%",
    headlineLabel: "across 25,870 held-out questions on NQ-Open, TriviaQA and PopQA",
    // No chart here on purpose: this one is not peer-reviewed yet, so it should
    // read lighter than the two results above it.
    detail:
      "Confidence cannot predict which you get, so the policy reads the retrieved passages instead — holding the accuracy of always-refine while cutting wrong answers from 47.5% to 10.6%.",
    venue: "Dissertation chapter · manuscript under review",
    publicationSlug: "adaptive-qa-abstention",
  },
];
