// ─── Plan Definitions ────────────────────────────────────────────────────────

export type PlanId = "starter" | "pro" | "agency";

export interface PlanPricing {
  id: PlanId;
  name: string;
  description: string;
  pricesINR: number; // in paise (₹1 = 100 paise)
  pricesUSD: number; // in cents
  pagesLimit: number;
  monitoring: boolean;
  competitorsLimit: number;
  apiAccess: boolean;
  whiteLabel: boolean;
}

export const PLANS: Record<PlanId, PlanPricing> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Full analysis with actionable suggestions",
    pricesINR: 149900, // ₹1,499
    pricesUSD: 1800, // $18
    pagesLimit: 50,
    monitoring: true,
    competitorsLimit: 1,
    apiAccess: false,
    whiteLabel: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Complete audit with AI-powered fix guides",
    pricesINR: 499900, // ₹4,999
    pricesUSD: 6000, // $60
    pagesLimit: 500,
    monitoring: true,
    competitorsLimit: 5,
    apiAccess: true,
    whiteLabel: false,
  },
  agency: {
    id: "agency",
    name: "Agency",
    description: "Multi-client management with white-label reports",
    pricesINR: 1499900, // ₹14,999
    pricesUSD: 18000, // $180
    pagesLimit: 500,
    monitoring: true,
    competitorsLimit: 999,
    apiAccess: true,
    whiteLabel: true,
  },
};

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function getProviderForCountry(country: string): "razorpay" | "stripe" {
  return country === "IN" ? "razorpay" : "stripe";
}
