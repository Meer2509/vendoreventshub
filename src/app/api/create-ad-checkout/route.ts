import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const prices: Record<string, number> = {
  homepage: 24900,
  events: 9900,
  event_detail: 7900,
  dashboard: 14900,
  vendor_directory: 4900,
  category_sponsor: 29900,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = prices[body.placement];

    if (!amount) {
      return NextResponse.json({ error: "Invalid placement." }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.vendoreventshub.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/advertise`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `VendorEventsHub Ad — ${body.placement}`,
              description: body.title || "Premium advertising placement",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        business_name: body.business_name || "",
        title: body.title || "",
        description: body.description || "",
        link_url: body.link_url || "",
        placement: body.placement || "",
        image_url: body.image_url || "",
        budget: body.budget || "",
        created_by: body.created_by || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Checkout failed." },
      { status: 500 }
    );
  }
}