import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import type { AuditResponse, Handover } from "@/lib/types";

// Audits can be long; allow up to 5 minutes (Vercel Fluid compute).
export const maxDuration = 300;
export const runtime = "nodejs";

const MODEL = process.env.AUDITPOINT_MODEL || "claude-sonnet-4-6";

let cachedPrompt: string | null = null;
function getSystemPrompt(): string {
  if (cachedPrompt) return cachedPrompt;
  const p = path.join(process.cwd(), "lib", "auditpoint-dw.prompt.md");
  cachedPrompt = fs.readFileSync(p, "utf8");
  return cachedPrompt;
}

// Split the model output into the markdown report (Part A) and the
// handover JSON block (Part B). Robust to missing/invalid JSON.
function splitOutput(text: string): { report: string; handover: Handover | null } {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match || match.index === undefined) {
    return { report: text.trim(), handover: null };
  }
  const report = text.slice(0, match.index).trim();
  let handover: Handover | null = null;
  try {
    handover = JSON.parse(match[1].trim()) as Handover;
  } catch {
    handover = null;
  }
  return { report, handover };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let plantData = "";
  try {
    const body = await req.json();
    plantData = (body?.plantData ?? "").toString().trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!plantData) {
    return NextResponse.json({ error: "No plant data provided." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: getSystemPrompt(),
      messages: [{ role: "user", content: plantData }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const { report, handover } = splitOutput(raw);
    const payload: AuditResponse = { report, handover, raw };
    return NextResponse.json(payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Audit failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
