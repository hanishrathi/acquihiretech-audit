import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — AcquiHire Audit",
  description: "Free, Starter, and Pro plans for website auditing. Starting at ₹1,499/mo.",
};

export default async function PricingPage() {
  const { userId } = await auth();
  return <PricingClient isSignedIn={Boolean(userId)} />;
}
