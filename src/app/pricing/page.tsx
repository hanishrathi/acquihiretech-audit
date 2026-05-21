import type { Metadata } from "next";
import { safeAuth } from "@/lib/auth";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — AcquiHire Audit",
  description: "Free, Starter, and Pro plans for website auditing. Starting at ₹1,499/mo.",
};

export default async function PricingPage() {
  const { userId } = await safeAuth();
  return <PricingClient isSignedIn={Boolean(userId)} />;
}
