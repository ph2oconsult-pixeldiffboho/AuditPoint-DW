# AuditPoint DW

Standalone drinking water process audit application. You give it a plant's data; it runs an
independent, evidence-based audit and returns:

- a **report** (executive summary, plant health dashboard, top risks, process-by-process findings,
  risk register, optimisation opportunities, staged improvements, data gaps), and
- a **handover package** (structured JSON) — scores, findings, risk ratings and gaps — designed to
  be consumed by downstream systems (e.g. the AquaPoint optimisation module) across a versioned contract.

The audit behaviour lives entirely in `lib/auditpoint-dw.prompt.md` (the runtime system prompt).
Edit that file to tune the audit; you do not need to touch the app code.

## Stack

- Next.js (App Router, TypeScript) — deploys to Vercel with no extra config
- Anthropic API for the audit engine (server-side only)

## Run locally

```bash
npm install
cp .env.example .env.local      # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000, click **Load sample plant**, then **Run audit**.

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel (it auto-detects Next.js).
2. In Vercel project settings → Environment Variables, add `ANTHROPIC_API_KEY`.
3. Deploy.

The audit route sets `maxDuration = 300`, so a full audit has up to 5 minutes (Vercel Fluid compute).
The system prompt markdown is bundled with the function via `outputFileTracingIncludes` in
`next.config.js`.

## How it works

- `app/page.tsx` — input form + tabbed report/dashboard output.
- `app/api/audit/route.ts` — loads the prompt, calls the Anthropic API, and splits the model output
  into the markdown report and the `json` handover block.
- `components/Dashboard.tsx` — renders the handover JSON as metric cards, a process health heatmap
  and a plotted risk matrix.
- `lib/auditpoint-dw.prompt.md` — the audit engine (persona, framework, behavioural rules, fixed
  scoring weights, output contract).

## Notes & limits

- **MVP shape.** This runs the audit as a single API call inside one serverless function. That is
  fine for expert-driven use. At higher volume, or where audits need to ingest large files or run
  many steps, move the engine behind a job queue + worker and keep this app as the front end.
- **File uploads.** This MVP takes pasted/typed text. To ingest P&IDs, SCADA exports or
  spreadsheets, add direct-to-object-storage uploads (presigned URLs) — Vercel functions cap request
  bodies at 4.5 MB, so do not POST large files through the route.
- **Data residency.** For sensitive utility/government data, check the region your functions run in
  and your Anthropic data-handling terms before production use.
- **Determinism.** Scoring weights are fixed in the prompt. For tighter run-to-run consistency you
  can also set a low temperature in the API call.
