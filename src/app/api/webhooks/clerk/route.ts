import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: any;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const eventType = event.type;
  const data = event.data;

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const email =
          data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id)
            ?.email_address || data.email_addresses?.[0]?.email_address;

        if (!email) break;

        await supabase.from("users").upsert(
          {
            clerk_id: data.id,
            email,
            name:
              [data.first_name, data.last_name].filter(Boolean).join(" ") ||
              null,
            plan: eventType === "user.created" ? "free" : undefined,
            crawls_remaining: eventType === "user.created" ? 3 : undefined,
            country: data.public_metadata?.country || "IN",
          },
          { onConflict: "clerk_id" }
        );
        break;
      }
      case "user.deleted": {
        await supabase.from("users").delete().eq("clerk_id", data.id);
        break;
      }
    }
  } catch (err: any) {
    console.error(`[clerk webhook] ${eventType} error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, type: eventType });
}
