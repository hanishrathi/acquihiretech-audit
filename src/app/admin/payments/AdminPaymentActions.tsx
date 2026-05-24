"use client";

import { useState } from "react";

export function AdminPaymentActions({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setError(null);
    let reason: string | undefined;
    if (action === "reject") {
      const r = window.prompt("Reason for rejection?");
      if (r === null) return;
      reason = r;
    }
    setLoading(action);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(null);
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => act("approve")}
        disabled={loading !== null}
        className="px-4 py-2 bg-score-excellent text-white rounded-[980px] font-medium text-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading === "approve" ? "Approving..." : "✓ Approve & upgrade"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading !== null}
        className="px-4 py-2 bg-white border border-border text-text rounded-[980px] font-medium text-sm hover:bg-bg-tint disabled:opacity-50"
      >
        {loading === "reject" ? "Rejecting..." : "Reject"}
      </button>
      {error && <p className="text-xs text-score-poor">{error}</p>}
    </div>
  );
}
