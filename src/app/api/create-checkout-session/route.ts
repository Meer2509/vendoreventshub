import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const priceMap: Record<string, string | undefined> = {
  homepage: process.env.STRIPE_PRICE_HOMEPAGE_AD,
  vendor_directory: process.env.STRIPE_PRICE_VENDOR_BOOST,
  events: process.env.STRIPE_PRICE_ORGANIZER_PREMIUM,
  event_detail: process.env.STRIPE_PRICE_EVENT_DETAIL,
  dashboard: process.env.STRIPE_PRICE_DASHBOARD_AD,
  category_sponsor: process.env.STRIPE_PRICE_CATEGORY_SPONSOR,
};

function safeMeta(value: unknown, max = 450) {
  return String(value || "").slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const placement = body.placement || body.plan || "homepage";
    const priceId = priceMap[placement];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid advertising placement selected." },
        { status: 400 }
      );
    }

    const price = await stripe.prices.retrieve(priceId);

    const mode: "payment" | "subscription" =
      price.type === "recurring" ? "subscription" : "payment";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.vendoreventshub.com";

    const session = await stripe.checkout.sessions.create({
      // @ts-ignore Stripe API expects embedded_page.
      ui_mode: "embedded_page",
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        platform: "VendorEventsHub",
        plan: safeMeta(body.plan || placement),
        placement: safeMeta(placement),
        business_name: safeMeta(body.business_name),
        ad_title: safeMeta(body.title),
        ad_description: safeMeta(body.description),
        link_url: safeMeta(body.link_url),
        image_url: safeMeta(body.image_url),
        budget: safeMeta(body.budget),
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Checkout session failed." },
      { status: 500 }
    );
  }
}