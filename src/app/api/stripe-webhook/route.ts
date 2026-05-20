import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error(
      "Webhook signature verification failed:",
      err
    );

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session =
      event.data.object as Stripe.Checkout.Session;

    const meta = session.metadata || {};

    const startsAt = new Date();

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 30
    );

    const customerEmail =
      session.customer_details?.email || "";

    // ======================
    // AD RENEWAL
    // ======================
    if (
      meta.renewal === "true" &&
      meta.renewal_ad_id
    ) {
      const { error } =
        await supabaseAdmin
          .from("ad_orders")
          .update({
            payment_status: "paid",
            approval_status:
              "approved",
            starts_at:
              startsAt.toISOString(),
            expires_at:
              expiresAt.toISOString(),
            amount_total:
              session.amount_total || 0,
            currency:
              session.currency || "usd",
            stripe_session_id:
              session.id,
            stripe_payment_intent:
              typeof session.payment_intent ===
              "string"
                ? session.payment_intent
                : null,
          })
          .eq(
            "id",
            meta.renewal_ad_id
          );

      if (error) {
        console.error(
          "Supabase renewal error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Renewal save failed",
          },
          { status: 500 }
        );
      }

      // Send renewal email
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject:
            "Your VendorEventsHub Ad Has Been Renewed",
          html: `
            <div style="font-family:Arial,sans-serif;padding:20px;">
              <h1 style="color:#14583f;">
                Your ad has been renewed 🎉
              </h1>

              <p>
                Thank you for renewing your
                VendorEventsHub placement.
              </p>

              <p>
                Your advertisement is now
                active for another
                <strong>30 days</strong>.
              </p>

              <a href="https://www.vendoreventshub.com"
                 style="display:inline-block;
                 background:#14583f;
                 color:white;
                 padding:12px 18px;
                 border-radius:999px;
                 text-decoration:none;">
                 Visit VendorEventsHub
              </a>
            </div>
          `,
        });
      }

      return NextResponse.json({
        received: true,
      });
    }

    // ======================
    // NEW AD PURCHASE
    // ======================
    const { error } =
      await supabaseAdmin
        .from("ad_orders")
        .upsert(
          {
            stripe_session_id:
              session.id,

            stripe_payment_intent:
              typeof session.payment_intent ===
              "string"
                ? session.payment_intent
                : null,

            customer_email:
              customerEmail,

            business_name:
              meta.business_name ||
              "Unknown Business",

            ad_title:
              meta.ad_title ||
              "Premium Sponsored Placement",

            ad_description:
              meta.ad_description ||
              "",

            link_url:
              meta.link_url || "",

            image_url:
              meta.image_url || "",

            placement:
              meta.placement ||
              "homepage",

            plan:
              meta.plan ||
              "homepage",

            budget:
              meta.budget || "",

            amount_total:
              session.amount_total || 0,

            currency:
              session.currency ||
              "usd",

            payment_status:
              "paid",

            approval_status:
              "pending_review",

            starts_at:
              startsAt.toISOString(),

            expires_at:
              expiresAt.toISOString(),
          },
          {
            onConflict:
              "stripe_session_id",
          }
        );

    if (error) {
      console.error(
        "Supabase ad insert error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Database save failed",
        },
        { status: 500 }
      );
    }

    // Send payment received email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject:
          "VendorEventsHub Ad Submission Received",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h1 style="color:#14583f;">
              Thank you for your order 🎉
            </h1>

            <p>
              We received your ad submission
              for:
            </p>

            <p>
              <strong>
                ${meta.ad_title || "Sponsored Placement"}
              </strong>
            </p>

            <p>
              Your payment has been received
              and your ad is currently under
              admin review.
            </p>

            <p>
              Once approved, it will go live
              on VendorEventsHub.
            </p>

            <a href="https://www.vendoreventshub.com"
               style="display:inline-block;
               background:#14583f;
               color:white;
               padding:12px 18px;
               border-radius:999px;
               text-decoration:none;">
               Visit VendorEventsHub
            </a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({
    received: true,
  });
}