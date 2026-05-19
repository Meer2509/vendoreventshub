import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const priceMap: Record<string, string | undefined> = {
  homepage: process.env.STRIPE_PRICE_HOMEPAGE_AD,
  vendor_directory: process.env.STRIPE_PRICE_VENDOR_BOOST,
  events: process.env.STRIPE_PRICE_ORGANIZER_PREMIUM,
  event_detail: process.env.STRIPE_PRICE_EVENT_DETAIL,
  dashboard: process.env.STRIPE_PRICE_DASHBOARD_AD,
  category_sponsor: process.env.STRIPE_PRICE_CATEGORY_SPONSOR,
};

export async function POST(req: Request) {
  try {
    const { adId } = await req.json();

    if (!adId) {
      return NextResponse.json({ error: "Missing ad ID." }, { status: 400 });
    }

    const { data: ad, error } = await supabaseAdmin
      .from("ad_orders")
      .select("*")
      .eq("id", adId)
      .single();

    if (error || !ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const priceId = priceMap[ad.placement];

    if (!priceId) {
      return NextResponse.json(
        { error: "No renewal price found for this placement." },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.vendoreventshub.com";

    const session = await stripe.checkout.sessions.create({
      // @ts-ignore
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        platform: "VendorEventsHub",
        renewal: "true",
        renewal_ad_id: ad.id,
        plan: ad.plan || ad.placement,
        placement: ad.placement,
        business_name: ad.business_name,
        ad_title: ad.ad_title,
        ad_description: ad.ad_description || "",
        link_url: ad.link_url || "",
        image_url: ad.image_url || "",
        budget: ad.budget || "",
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Renewal checkout error:", error);
    return NextResponse.json(
      { error: "Renewal checkout failed." },
      { status: 500 }
    );
  }
}