"use client";

import { Handover } from "@/lib/types";
import { DIMENSIONS } from "@/lib/types";

const SCORE_COLOR: Record<number, string> = {
  1: "#a32d2d",
  2: "#e24b4a",
  3: "#ba7517",
  4: "#639922",
  5: "#3b6d11",
};

function scoreColor(v: number | null): string {
  if (v === null || v === undefined) return "#3a3a3a";
  const r = Math.max(1, Math.min(5, Math.round(v)));
  return SCORE_COLOR[r];
}

const RISK_COLOR: Record<string, string> = {
  low: "#639922",
  medium: "#ba7517",
  high: "#d85a30",
  extreme: "#e24b4a",
  critical: "#a32d2d",
};

const LIKELIHOODS = ["Almost Certain", "Likely", "Possible", "Unlikely", "Rare"];
const CONSEQUENCES = ["Minor", "Moderate", "Major", "Critical", "Catastrophic"];

function norm(s: string | undefined | null): string {
  return (s || "").trim().toLowerCase();
}

export default function Dashboard({ data }: { data: Handover }) {
  const highPlus = data.findings.filter((f) =>
    ["high", "extreme", "critical"].includes(norm(f.risk?.rating))
  ).length;

  // Build the risk matrix counts.
  const cell: Record<string, number> = {};
  for (const f of data.findings) {
    const l = LIKELIHOODS.findIndex((x) => norm(x) === norm(f.risk?.likelihood));
    const c = CONSEQUENCES.findIndex((x) => norm(x) === norm(f.risk?.consequence));
    if (l >= 0 && c >= 0) cell[`${l}-${c}`] = (cell[`${l}-${c}`] || 0) + 1;
  }

  return (
    <div className="dash">
      <div className="metrics">
        <Metric label="Overall health" value={`${data.overall_health_score?.toFixed(1) ?? "—"}`} unit="/ 5" />
        <Metric label="Assessment confidence" value={cap(data.assessment_confidence)} />
        <Metric label="Processes assessed" value={`${data.process_scores?.length ?? 0}`} />
        <Metric label="High+ risks" value={`${highPlus}`} danger={highPlus > 0} />
        <Metric label="Data gaps" value={`${data.gaps?.length ?? 0}`} />
      </div>

      {data.process_scores?.length > 0 && (
        <section className="panel">
          <h3>Process health matrix</h3>
          <p className="sub">Every process scored 1&ndash;5 across ten dimensions.</p>
          <div className="hm" style={{ gridTemplateColumns: `150px repeat(${DIMENSIONS.length}, 1fr)` }}>
            <div />
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="hm-hd" title={d.label}>{d.short}</div>
            ))}
            {data.process_scores.map((ps) => (
              <Row key={ps.process} name={ps.process} scores={ps.scores} />
            ))}
          </div>
          <div className="legend">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}><i style={{ background: SCORE_COLOR[n] }} />{n}</span>
            ))}
          </div>
          <p className="abbr">
            {DIMENSIONS.map((d) => `${d.short} ${d.label.toLowerCase()}`).join(" · ")}
          </p>
        </section>
      )}

      {data.findings?.length > 0 && (
        <section className="panel">
          <h3>Risk register &mdash; plotted</h3>
          <p className="sub">Findings by likelihood &times; consequence.</p>
          <div className="rm">
            {LIKELIHOODS.map((lk, i) => (
              <div className="rm-row" key={lk}>
                <div className="rm-rl">{lk}</div>
                {CONSEQUENCES.map((_, j) => {
                  const n = cell[`${i}-${j}`];
                  return (
                    <div key={j} className="rm-cell" style={{ background: matrixBand(i, j) }}>
                      {n ? n : ""}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="rm-row">
              <div className="rm-rl" />
              {CONSEQUENCES.map((c) => (
                <div key={c} className="rm-hd">{c}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.gaps?.length > 0 && (
        <section className="panel">
          <h3>Data gaps</h3>
          <ul className="gaps">
            {data.gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, unit, danger }: { label: string; value: string; unit?: string; danger?: boolean }) {
  return (
    <div className="metric">
      <div className="m-label">{label}</div>
      <div className="m-value" style={danger ? { color: "#e24b4a" } : undefined}>
        {value} {unit && <span className="m-unit">{unit}</span>}
      </div>
    </div>
  );
}

function Row({ name, scores }: { name: string; scores: Handover["process_scores"][number]["scores"] }) {
  return (
    <>
      <div className="hm-rl" title={name}>{name}</div>
      {DIMENSIONS.map((d) => {
        const v = scores?.[d.key] ?? null;
        return (
          <div key={d.key} className="hm-cell" style={{ background: scoreColor(v) }}>
            {v ?? "–"}
          </div>
        );
      })}
    </>
  );
}

// Standard escalating 5x5 band layout.
function matrixBand(likeIdx: number, consIdx: number): string {
  const grid = [
    ["medium", "high", "high", "extreme", "critical"],
    ["medium", "medium", "high", "high", "extreme"],
    ["low", "medium", "high", "high", "extreme"],
    ["low", "low", "medium", "high", "high"],
    ["low", "low", "medium", "medium", "high"],
  ];
  return RISK_COLOR[grid[likeIdx][consIdx]];
}

function cap(s: string | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
