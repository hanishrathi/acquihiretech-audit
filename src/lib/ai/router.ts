/**
 * Dual AI engine router.
 *
 * Routes analysis tasks to Claude (Anthropic) or GPT-4o (OpenAI) based on
 * what each model is best at:
 *  - Claude (Haiku/Sonnet): nuanced writing, content analysis, fix guides
 *  - GPT-4o: structured/JSON output, numerical estimation
 *
 * All AI calls are best-effort — if either provider is misconfigured or
 * errors, audits still complete with rule-based results only.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { CheckResult } from "@/lib/scoring";

const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

let anthropic: Anthropic | null = null;
let openai: OpenAI | null = null;

if (anthropicKey) anthropic = new Anthropic({ apiKey: anthropicKey });
if (openaiKey) openai = new OpenAI({ apiKey: openaiKey });

export function isAIConfigured(): { claude: boolean; gpt: boolean } {
  return { claude: Boolean(anthropic), gpt: Boolean(openai) };
}

// ─── Fix Guide Generation (Claude Sonnet) ────────────────────────────────────

export async function generateFixGuide(
  issue: CheckResult,
  domain: string
): Promise<string | null> {
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are writing a fix guide for a website audit issue.

Site: ${domain}
Category: ${issue.category}
Severity: ${issue.severity}
Issue: ${issue.title}
Description: ${issue.description}

Write a concrete, actionable fix guide. Format:
1. What's happening (1 sentence)
2. Why it matters (1 sentence)
3. How to fix (3-5 numbered steps with code examples where helpful)
4. Time estimate (e.g., "15 minutes")

Use markdown formatting. Code blocks in triple backticks. Keep it under 400 words. Be specific and practical, not generic.`,
        },
      ],
      system:
        "You are a senior web performance and SEO engineer at AcquiHire. Write fix guides that a non-developer business owner could follow, but include code examples for the technical person who'll implement them. Match AcquiHire's clear, practical tone — no marketing fluff.",
    });

    const block = response.content[0];
    return block.type === "text" ? block.text : null;
  } catch (err) {
    console.error("[ai] generateFixGuide error:", err);
    return null;
  }
}

// ─── Revenue Impact Estimation (GPT-4o) ──────────────────────────────────────

export async function estimateRevenueImpact(
  issue: CheckResult,
  domain: string,
  vertical?: string
): Promise<string | null> {
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cost-efficient for numerical reasoning
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are a conversion rate optimization expert. Estimate the realistic business impact of website issues in plain language. Use industry benchmarks. Be conservative — under-promise. Return a single sentence in this format: 'Could increase [metric] by [X-Y%], typically translating to [N-M] additional [leads/conversions] per month for a site with [traffic range].'",
        },
        {
          role: "user",
          content: `Issue: ${issue.title}
Category: ${issue.category}
Severity: ${issue.severity}
Site: ${domain}
${vertical ? `Vertical: ${vertical}` : ""}

What is the realistic revenue/lead impact of fixing this? Use industry data.`,
        },
      ],
    });

    return response.choices[0]?.message?.content || null;
  } catch (err) {
    console.error("[ai] estimateRevenueImpact error:", err);
    return null;
  }
}

// ─── Content Quality Analysis (Claude Haiku — fast) ──────────────────────────

export async function analyzeContentQuality(
  textContent: string,
  domain: string
): Promise<{ score: number; analysis: string } | null> {
  if (!anthropic) return null;

  try {
    const truncated = textContent.slice(0, 4000); // keep cost low
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Analyze the content quality of this website's homepage text. Return JSON only:

{
  "score": <0-100>,
  "analysis": "<2 sentences explaining the score>",
  "issues": ["<top issue 1>", "<top issue 2>"]
}

Website: ${domain}
Content (truncated):
${truncated}`,
        },
      ],
      system:
        "You analyze website content for clarity, value proposition strength, and conversion potential. Return valid JSON only, no preamble.",
    });

    const block = response.content[0];
    if (block.type !== "text") return null;

    // Extract JSON from response (Claude sometimes wraps in markdown)
    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return { score: parsed.score, analysis: parsed.analysis };
  } catch (err) {
    console.error("[ai] analyzeContentQuality error:", err);
    return null;
  }
}

// ─── Brand Consistency Summary (Claude Sonnet) ───────────────────────────────

export async function summarizeBrandConsistency(
  domain: string,
  signals: Record<string, any>
): Promise<string | null> {
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Brand consistency signals for ${domain}:
${JSON.stringify(signals, null, 2)}

Write 2 sentences: (1) what's strong about their brand consistency, (2) what's weak and should be fixed.`,
        },
      ],
    });

    const block = response.content[0];
    return block.type === "text" ? block.text : null;
  } catch (err) {
    console.error("[ai] summarizeBrandConsistency error:", err);
    return null;
  }
}
