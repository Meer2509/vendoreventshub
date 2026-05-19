import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabaseAdmin.from("ad_orders").upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        customer_email: session.customer_details?.email || null,
        business_name: meta.business_name || "Unknown Business",
        ad_title: meta.ad_title || "Premium Sponsored Placement",
        ad_description: meta.ad_description || "",
        link_url: meta.link_url || "",
        image_url: meta.image_url || "",
        placement: meta.placement || "homepage",
        plan: meta.plan || "homepage",
        budget: meta.budget || "",
        amount_total: session.amount_total || 0,
        currency: session.currency || "usd",
        payment_status: "paid",
        approval_status: "pending_review",
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "stripe_session_id" }
    );

    if (error) {
      console.error("Supabase ad order insert error:", error);
      return NextResponse.json({ error: "Database save failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}