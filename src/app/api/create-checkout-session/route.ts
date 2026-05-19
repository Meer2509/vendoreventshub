import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const priceMap: Record<string, string | undefined> = {
  homepage: process.env.STRIPE_PRICE_HOMEPAGE_AD,
  vendor: process.env.STRIPE_PRICE_VENDOR_BOOST,
  organizer: process.env.STRIPE_PRICE_ORGANIZER_PREMIUM,
};

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    const priceId = priceMap[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    const price = await stripe.prices.retrieve(priceId);

    const mode =
      price.type === "recurring"
        ? "subscription"
        : "payment";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.vendoreventshub.com";

    const session = await stripe.checkout.sessions.create({
      // @ts-ignore
      ui_mode: "embedded",
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        platform: "VendorEventsHub",
        plan,
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