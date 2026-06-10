"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Dashboard from "@/components/Dashboard";
import { AuditResponse } from "@/lib/types";
import { SAMPLE_PLANT } from "@/lib/sample";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [tab, setTab] = useState<"dashboard" | "report">("dashboard");

  async function runAudit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantData: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Audit failed.");
      setResult(data as AuditResponse);
      setTab(data.handover ? "dashboard" : "report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header className="head">
        <div>
          <div className="eyebrow">AuditPoint DW</div>
          <h1>Drinking water process audit</h1>
        </div>
      </header>

      <section className="input-card">
        <label htmlFor="plant">Plant data</label>
        <p className="hint">
          Paste whatever you have — process train, design basis, raw water stats, SCADA, compliance,
          assets. Missing inputs are reported as gaps, not invented.
        </p>
        <textarea
          id="plant"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste plant data here…"
          rows={12}
        />
        <div className="actions">
          <button onClick={runAudit} disabled={loading || !input.trim()} className="primary">
            {loading ? "Auditing…" : "Run audit"}
          </button>
          <button onClick={() => setInput(SAMPLE_PLANT)} disabled={loading} className="ghost">
            Load sample plant
          </button>
        </div>
        {loading && (
          <p className="working">Running the audit — this can take a minute for a full plant.</p>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <section className="output">
          <div className="tabs">
            <button
              className={tab === "dashboard" ? "on" : ""}
              onClick={() => setTab("dashboard")}
              disabled={!result.handover}
            >
              Dashboard
            </button>
            <button className={tab === "report" ? "on" : ""} onClick={() => setTab("report")}>
              Report
            </button>
          </div>

          {tab === "dashboard" && result.handover && <Dashboard data={result.handover} />}
          {tab === "dashboard" && !result.handover && (
            <p className="hint">No structured handover was returned — see the report.</p>
          )}
          {tab === "report" && (
            <article className="report">
              <ReactMarkdown>{result.report}</ReactMarkdown>
            </article>
          )}
        </section>
      )}
    </main>
  );
}
