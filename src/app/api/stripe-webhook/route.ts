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
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    await supabaseAdmin.from("sponsored_ads").insert({
      business_name: meta.business_name,
      title: meta.title,
      description: meta.description,
      link_url: meta.link_url,
      placement: meta.placement,
      image_url: meta.image_url,
      budget: meta.budget,
      created_by: meta.created_by || null,
      stripe_session_id: session.id,
      payment_status: "paid",
      approval_status: "pending",
      is_active: false,
    });
  }

  return NextResponse.json({ received: true });
}