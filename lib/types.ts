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

export interface ProcessScore {
  process: string;
  scores: Scores;
  health_score: number | null;
  status: "ok" | "watch" | "deficient";
}

export interface Finding {
  id: string;
  process: string;
  constraint: string;
  evidence: string[];
  status: "confirmed" | "provisional" | "data_gap";
  confidence: number | null;
  likely_root_cause: string | null;
  water_quality_impact: string | null;
  capacity_impact: string | null;
  scores: Scores | null;
  risk: { likelihood: string; consequence: string; rating: string } | null;
  optimisation_objective: string | null;
  candidate_technologies: string[];
  required_inputs: string[];
}

export interface Handover {
  schema_version: string;
  plant_id: string;
  overall_health_score: number;
  assessment_confidence: "high" | "moderate" | "low";
  process_scores: ProcessScore[];
  findings: Finding[];
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
