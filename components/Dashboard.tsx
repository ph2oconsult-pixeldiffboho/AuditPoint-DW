"use client";

import { Handover, HML } from "@/lib/types";
import { DIMENSIONS } from "@/lib/types";

const SCORE_COLOR: Record<number, string> = {
  1: "#a32d2d", 2: "#e24b4a", 3: "#ba7517", 4: "#639922", 5: "#3b6d11",
};
function scoreColor(v: number | null): string {
  if (v === null || v === undefined) return "#3a3a3a";
  return SCORE_COLOR[Math.max(1, Math.min(5, Math.round(v)))];
}

const RISK_COLOR: Record<string, string> = {
  low: "#639922", medium: "#ba7517", high: "#d85a30", extreme: "#e24b4a", critical: "#a32d2d",
};
const OBJ_COLOR: Record<string, string> = {
  yes: "#639922", partial: "#ba7517", no: "#a32d2d", not_assessed: "#555",
};
const SEV_COLOR: Record<HML, string> = { H: "#a32d2d", M: "#ba7517", L: "#639922" };
const CONF_COLOR: Record<HML, string> = { H: "#639922", M: "#ba7517", L: "#555" };
const PTY_COLOR: Record<HML, string> = { H: "#a32d2d", M: "#ba7517", L: "#639922" };
const DOC_COLOR: Record<string, string> = { held: "#639922", requested: "#ba7517", unavailable: "#a32d2d" };

const LIKELIHOODS = ["Almost Certain", "Likely", "Possible", "Unlikely", "Rare"];
const CONSEQUENCES = ["Minor", "Moderate", "Major", "Critical", "Catastrophic"];
const norm = (s?: string | null) => (s || "").trim().toLowerCase();
const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

function Chip({ text, color }: { text: string; color: string }) {
  return <span className="chip" style={{ background: color }}>{text}</span>;
}

export default function Dashboard({ data }: { data: Handover }) {
  const findings = data.findings ?? [];
  const procs = data.process_scores ?? [];
  const actions = data.action_register ?? [];
  const docs = data.document_register ?? [];
  const open = data.matters_requiring_further_evidence ?? [];
  const gaps = data.gaps ?? [];

  const highPlus = findings.filter((f) => ["high", "extreme", "critical"].includes(norm(f.risk?.rating))).length;
  const missingDocs = docs.filter((d) => norm(d.status) === "unavailable").length;

  const cell: Record<string, number> = {};
  for (const f of findings) {
    const l = LIKELIHOODS.findIndex((x) => norm(x) === norm(f.risk?.likelihood));
    const c = CONSEQUENCES.findIndex((x) => norm(x) === norm(f.risk?.consequence));
    if (l >= 0 && c >= 0) cell[`${l}-${c}`] = (cell[`${l}-${c}`] || 0) + 1;
  }

  return (
    <div className="dash">
      <div className="metrics">
        <Metric label="Overall health" value={data.overall_health_score?.toFixed(1) ?? "—"} unit="/ 5" />
        <Metric label="Assessment confidence" value={cap(data.assessment_confidence)} />
        <Metric label="Processes assessed" value={`${procs.length}`} />
        <Metric label="High+ risks" value={`${highPlus}`} danger={highPlus > 0} />
        <Metric label="Open actions" value={`${actions.length}`} />
        <Metric label="Docs unavailable" value={`${missingDocs}`} danger={missingDocs > 0} />
      </div>

      {procs.length > 0 && (
        <section className="panel">
          <h3>Process health matrix</h3>
          <p className="sub">Every process scored 1&ndash;5 across ten dimensions.</p>
          <div className="hm" style={{ gridTemplateColumns: `160px repeat(${DIMENSIONS.length}, 1fr)` }}>
            <div />
            {DIMENSIONS.map((d) => <div key={d.key} className="hm-hd" title={d.label}>{d.short}</div>)}
            {procs.map((ps) => (
              <Row key={ps.process} ps={ps} />
            ))}
          </div>
          <div className="legend">
            {[1, 2, 3, 4, 5].map((n) => <span key={n}><i style={{ background: SCORE_COLOR[n] }} />{n}</span>)}
          </div>
          <p className="abbr">{DIMENSIONS.map((d) => `${d.short} ${d.label.toLowerCase()}`).join(" · ")}</p>
        </section>
      )}

      {procs.length > 0 && (
        <section className="panel">
          <h3>Engineering assessment</h3>
          <p className="sub">Is each process achieving its design objective?</p>
          <table className="tbl">
            <thead><tr><th>Process</th><th>Objective</th><th>Severity</th><th>Confidence</th></tr></thead>
            <tbody>
              {procs.map((ps) => (
                <tr key={ps.process}>
                  <td>{ps.process}</td>
                  <td><Chip text={(ps.objective_achieved || "—").replace("_", " ")} color={OBJ_COLOR[ps.objective_achieved] || "#555"} /></td>
                  <td><Chip text={ps.severity || "—"} color={SEV_COLOR[ps.severity] || "#555"} /></td>
                  <td><Chip text={ps.confidence || "—"} color={CONF_COLOR[ps.confidence] || "#555"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {findings.length > 0 && (
        <section className="panel">
          <h3>Risk register &mdash; plotted</h3>
          <p className="sub">Findings by likelihood &times; consequence.</p>
          <div className="rm">
            {LIKELIHOODS.map((lk, i) => (
              <div className="rm-row" key={lk}>
                <div className="rm-rl">{lk}</div>
                {CONSEQUENCES.map((_, j) => (
                  <div key={j} className="rm-cell" style={{ background: matrixBand(i, j) }}>{cell[`${i}-${j}`] || ""}</div>
                ))}
              </div>
            ))}
            <div className="rm-row">
              <div className="rm-rl" />
              {CONSEQUENCES.map((c) => <div key={c} className="rm-hd">{c}</div>)}
            </div>
          </div>
        </section>
      )}

      {findings.length > 0 && (
        <section className="panel">
          <h3>Principal findings</h3>
          <table className="tbl">
            <thead><tr><th>Finding</th><th>Source</th><th>Type</th><th>Sev</th><th>Status</th></tr></thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id}>
                  <td>{f.finding}</td>
                  <td className="dim">{f.source_section || "—"}</td>
                  <td className="dim">{f.issue_type ? f.issue_type[0].toUpperCase() : "—"}</td>
                  <td><Chip text={f.severity || "—"} color={f.severity ? SEV_COLOR[f.severity] : "#555"} /></td>
                  <td className="dim">{(f.status || "").replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {actions.length > 0 && (
        <section className="panel">
          <h3>Consolidated action register</h3>
          <p className="sub">Prioritised: H act now &middot; M plan this period &middot; L opportunistic.</p>
          <table className="tbl">
            <thead><tr><th>#</th><th>Source</th><th>Action</th><th>Pty</th><th>Owner / by when</th></tr></thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={i}>
                  <td className="dim">{a.ref || i + 1}</td>
                  <td className="dim">{a.source || "—"}</td>
                  <td>{a.action}</td>
                  <td><Chip text={a.priority || "—"} color={a.priority ? PTY_COLOR[a.priority] : "#555"} /></td>
                  <td className="dim">{a.owner_by_when || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {open.length > 0 && (
        <section className="panel">
          <h3>Matters requiring further evidence</h3>
          <ul className="gaps">
            {open.map((o, i) => (
              <li key={i}><strong>{o.question}</strong> — {o.evidence_that_would_close}</li>
            ))}
          </ul>
        </section>
      )}

      {docs.length > 0 && (
        <section className="panel">
          <h3>Document register</h3>
          <p className="sub">Absence of a document is itself a finding.</p>
          <div className="docs">
            {docs.map((d, i) => (
              <div key={i} className="docrow">
                <Chip text={d.status || "—"} color={DOC_COLOR[norm(d.status)] || "#555"} />
                <span>{d.item}</span>
                {d.period && <span className="dim">({d.period})</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {gaps.length > 0 && (
        <section className="panel">
          <h3>Data gaps</h3>
          <ul className="gaps">{gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
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

function Row({ ps }: { ps: Handover["process_scores"][number] }) {
  return (
    <>
      <div className="hm-rl" title={ps.process}>{ps.process}</div>
      {DIMENSIONS.map((d) => {
        const v = ps.scores?.[d.key] ?? null;
        return <div key={d.key} className="hm-cell" style={{ background: scoreColor(v) }}>{v ?? "–"}</div>;
      })}
    </>
  );
}

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
