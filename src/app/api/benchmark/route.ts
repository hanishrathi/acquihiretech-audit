import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache the benchmark calculation for 10 minutes (avoids hammering Supabase
// on every report view). Will refresh as audit volume grows.
export const revalidate = 600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      ready: false,
      message: "Benchmark unavailable",
    });
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Pull all overall_scores from completed audits
    const { data, error } = await client
      .from("audit_runs")
      .select("overall_score")
      .eq("status", "complete")
      .not("overall_score", "is", null);

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        ready: false,
        sampleSize: 0,
      });
    }

    const scores = data
      .map((r) => parseFloat(r.overall_score as unknown as string))
      .filter((s) => !isNaN(s))
      .sort((a, b) => a - b);

    const n = scores.length;
    const median = n % 2 === 0
      ? (scores[n / 2 - 1] + scores[n / 2]) / 2
      : scores[Math.floor(n / 2)];

    const mean = scores.reduce((a, b) => a + b, 0) / n;
    const p25 = scores[Math.floor(n * 0.25)];
    const p75 = scores[Math.floor(n * 0.75)];
    const max = scores[n - 1];
    const min = scores[0];

    return NextResponse.json({
      ready: n >= 5, // only show benchmark UI once we have meaningful data
      sampleSize: n,
      median: Math.round(median * 10) / 10,
      mean: Math.round(mean * 10) / 10,
      p25: Math.round(p25 * 10) / 10,
      p75: Math.round(p75 * 10) / 10,
      max: Math.round(max * 10) / 10,
      min: Math.round(min * 10) / 10,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ready: false, error: error.message },
      { status: 500 }
    );
  }
}
