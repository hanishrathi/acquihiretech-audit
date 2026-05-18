import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export interface UserRecord {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  plan: "free" | "starter" | "pro" | "agency";
  plan_expires_at: string | null;
  crawls_remaining: number;
  country: string;
  razorpay_customer_id: string | null;
  stripe_customer_id: string | null;
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const client = getAdminClient();
  if (!client) return null;

  const { data } = await client
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  return (data as UserRecord) || null;
}

export async function ensureUser(
  clerkId: string,
  email: string,
  name: string | null = null,
  country: string = "IN"
): Promise<UserRecord | null> {
  const client = getAdminClient();
  if (!client) return null;

  const { data } = await client
    .from("users")
    .upsert(
      { clerk_id: clerkId, email, name, country },
      { onConflict: "clerk_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  return (data as UserRecord) || null;
}

export async function getUserProjects(userId: string) {
  const client = getAdminClient();
  if (!client) return [];

  const { data } = await client
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getUserAudits(userId: string, limit = 20) {
  const client = getAdminClient();
  if (!client) return [];

  const { data } = await client
    .from("audit_runs")
    .select("*, projects!inner(*)")
    .eq("projects.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}
