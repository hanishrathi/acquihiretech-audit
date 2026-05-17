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

  return NextResponse.json({
    id: audit.id,
    status: audit.status,
    url: audit.url,
  });
}
