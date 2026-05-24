import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { ensureUser } from "@/lib/db/user";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import {
  CRYPTO_CHAINS,
  type CryptoChain,
  chainAddress,
  convertInrToCrypto,
  listConfiguredChains,
} from "@/lib/payments/crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const configured = listConfiguredChains();
  if (configured.length === 0) {
    return NextResponse.json(
      {
        error:
          "Crypto not configured — set at least one of CRYPTO_BTC_ADDRESS / CRYPTO_ETH_ADDRESS / CRYPTO_POLYGON_ADDRESS",
      },
      { status: 503 }
    );
  }

  const body = await req.json();
  const planId = body.planId as PlanId;
  const chain = body.chain as CryptoChain;
  if (!planId || !PLANS[planId]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!chain || !CRYPTO_CHAINS[chain] || !configured.includes(chain)) {
    return NextResponse.json(
      { error: `Chain ${chain} is not configured` },
      { status: 400 }
    );
  }

  const address = chainAddress(chain);
  if (!address) {
    return NextResponse.json({ error: "No wallet address" }, { status: 503 });
  }

  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
  const user = await ensureUser(userId, email, name);
  if (!user) {
    return NextResponse.json({ error: "User record failed" }, { status: 500 });
  }

  const plan = PLANS[planId];

  let cryptoAmount: string;
  try {
    cryptoAmount = await convertInrToCrypto(plan.pricesINR, chain);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Could not fetch current rate: " + err.message },
      { status: 502 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: payment, error } = await supabase
    .from("pending_payments")
    .insert({
      user_id: user.id,
      user_email: email,
      plan_id: planId,
      method: "crypto",
      amount_inr: plan.pricesINR,
      crypto_chain: chain,
      crypto_address: address,
      crypto_amount_native: cryptoAmount,
      status: "awaiting_payment",
    })
    .select()
    .single();

  if (error || !payment) {
    return NextResponse.json(
      { error: error?.message || "Failed to create payment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ paymentId: payment.id });
}
