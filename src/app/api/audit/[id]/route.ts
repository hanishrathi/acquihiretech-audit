import { NextResponse } from "next/server";
import { getAudit } from "@/lib/db/audit-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Strip the internal _allIssues field from API responses
  if (audit.result && "_allIssues" in audit.result) {
    const { _allIssues, ...publicResult } = audit.result;
    return NextResponse.json({ ...audit, result: publicResult });
  }

  return NextResponse.json(audit);
}
