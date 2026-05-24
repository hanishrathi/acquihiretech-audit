"use client";

import { useState } from "react";

export function UpiSubmitForm({ paymentId }: { paymentId: string }) {
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!utr.trim()) {
      setError("Please enter the UTR / transaction reference");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/upi/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr: utr.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={utr}
        onChange={(e) => setUtr(e.target.value)}
        placeholder="UTR / Transaction reference (e.g., 234812345678)"
        className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-engine-conversion font-mono"
        autoFocus
      />
      {error && <p className="text-sm text-score-poor">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit UTR for verification"}
      </button>
    </form>
  );
}
