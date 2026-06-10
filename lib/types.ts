export type Dimension =
  | "design"
  | "performance"
  | "reliability"
  | "maintainability"
  | "operability"
  | "instrumentation"
  | "automation"
  | "resilience"
  | "optimisation_potential"
  | "confidence";

export type Scores = Record<Dimension, number | null>;
export type HML = "H" | "M" | "L";

export interface ProcessScore {
  process: string;
  part: "B" | "C";
  duty: string;
  objective_achieved: "yes" | "partial" | "no" | "not_assessed";
  severity: HML;
  confidence: HML;
  scores: Scores;
  health_score: number | null;
  evidence: string[];
}

export interface CandidateAction {
  action: string;
  priority: HML;
  owner_by_when: string;
}

export interface Finding {
  id: string;
  source_section: string;
  finding: string;
  finding_type: "fact" | "judgement";
  issue_type: "design" | "configuration" | "operational";
  evidence: string[];
  status: "confirmed" | "provisional" | "data_gap";
  consequence: string | null;
  severity: HML | null;
  confidence: HML | null;
  risk: { likelihood: string; consequence: string; rating: string } | null;
  optimisation_objective: string | null;
  candidate_actions: CandidateAction[];
  required_inputs: string[];
}

export interface DocRegisterItem {
  item: string;
  status: "held" | "requested" | "unavailable";
  period: string;
  comment: string;
}

export interface ActionRegisterItem {
  ref: string;
  source: string;
  action: string;
  priority: HML;
  owner_by_when: string;
}

export interface OpenEvidence {
  question: string;
  evidence_that_would_close: string;
}

export interface ReviewContext {
  output_at_review: string;
  proportion_of_design_flow: string;
  sources_in_use: string;
  recent_events: string;
}

export interface Handover {
  schema_version: string;
  plant_id: string;
  review_context: ReviewContext | null;
  overall_health_score: number;
  assessment_confidence: "high" | "moderate" | "low";
  document_register: DocRegisterItem[];
  process_scores: ProcessScore[];
  findings: Finding[];
  matters_requiring_further_evidence: OpenEvidence[];
  action_register: ActionRegisterItem[];
  gaps: string[];
}

export interface AuditResponse {
  report: string;
  handover: Handover | null;
  raw: string;
}

export const DIMENSIONS: { key: Dimension; label: string; short: string }[] = [
  { key: "design", label: "Design", short: "Des" },
  { key: "performance", label: "Performance", short: "Per" },
  { key: "reliability", label: "Reliability", short: "Rel" },
  { key: "maintainability", label: "Maintainability", short: "Mnt" },
  { key: "operability", label: "Operability", short: "Op" },
  { key: "instrumentation", label: "Instrumentation", short: "Ins" },
  { key: "automation", label: "Automation", short: "Aut" },
  { key: "resilience", label: "Resilience", short: "Res" },
  { key: "optimisation_potential", label: "Optimisation potential", short: "Opt" },
  { key: "confidence", label: "Confidence", short: "Cnf" },
];
