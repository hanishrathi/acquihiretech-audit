import { NextResponse } from "next/server";
import { auditStore } from "../../quick/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audit = auditStore.get(id);

  if (!audit) {
    return NextResponse.json(
      { error: "Audit not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: audit.id,
    status: audit.status,
    url: audit.url,
  });
}
