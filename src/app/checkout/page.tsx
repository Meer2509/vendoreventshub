"use client";

import { Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const planNames: Record<string, string> = {
  homepage: "Homepage Premium Ad",
  vendor: "Featured Vendor Boost",
  organizer: "Organizer Premium Placement",
};

function CheckoutContent() {
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan") || "homepage";
  const planName = planNames[plan] || "Premium Advertising Plan";

  const businessName = searchParams.get("business_name") || "Your Business";
  const adTitle = searchParams.get("title") || "Premium Sponsored Placement";
  const adDescription =
    searchParams.get("description") || "Your advertising request";
  const placement = searchParams.get("placement") || plan;
  const budget = searchParams.get("budget") || "Premium Plan";
  const linkUrl = searchParams.get("link_url") || "Not provided";
  const imageUrl = searchParams.get("image_url") || "";

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        business_name: businessName,
        title: adTitle,
        description: adDescription,
        link_url: linkUrl,
        image_url: imageUrl,
        placement,
        budget,
      }),
    });

    const data = await res.json();

    if (!data.clientSecret) {
      throw new Error(data.error || "Unable to start checkout.");
    }

    return data.clientSecret;
  }, [
    plan,
    businessName,
    adTitle,
    adDescription,
    linkUrl,
    imageUrl,
    placement,
    budget,
  ]);

  return (
    <main style={styles.page}>
      <section style={styles.wrap}>
        <Link href="/advertise" style={styles.back}>
          ← Back to advertising
        </Link>

        <div style={styles.hero}>
          <div style={styles.badge}>VendorEventsHub Premium Checkout</div>
          <h1 style={styles.title}>Complete your premium ad placement.</h1>
          <p style={styles.sub}>
            Review your advertising request below, then complete your secure
            payment inside VendorEventsHub using Stripe.
          </p>
        </div>

        <section style={styles.grid}>
          <aside style={styles.card}>
            <h2 style={styles.cardTitle}>Advertising order summary</h2>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ad preview"
                style={styles.previewImage}
              />
            )}

            <div style={styles.summary}>
              <p>
                <strong>Business Name</strong>
                <br />
                {businessName}
              </p>

              <p>
                <strong>Ad Headline</strong>
                <br />
                {adTitle}
              </p>

              <p>
                <strong>Description</strong>
                <br />
                {adDescription}
              </p>

              <p>
                <strong>Placement</strong>
                <br />
                {placement}
              </p>

              <p>
                <strong>Selected Plan</strong>
                <br />
                {planName}
              </p>

              <p>
                <strong>Budget</strong>
                <br />
                {budget}
              </p>

              <p>
                <strong>Website Link</strong>
                <br />
                {linkUrl}
              </p>
            </div>

            <div style={styles.nextBox}>
              <strong>What happens after payment?</strong>
              <p>✓ Your payment is securely processed by Stripe.</p>
              <p>✓ Your ad request enters review.</p>
              <p>✓ VendorEventsHub activates the placement after approval.</p>
              <p>✓ Your ad runs for 30 days after approval.</p>
            </div>
          </aside>

          <div style={styles.checkoutBox}>
            <div style={styles.checkoutHeader}>
              <h2 style={styles.checkoutTitle}>Secure payment</h2>
              <p style={styles.checkoutText}>
                VendorEventsHub never stores your card details.
              </p>
            </div>

            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main style={styles.page}>
          <section style={styles.wrap}>
            <div style={styles.hero}>
              <div style={styles.badge}>VendorEventsHub Premium</div>
              <h1 style={styles.title}>Loading secure checkout...</h1>
            </div>
          </section>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#10291f",
    padding: "32px 16px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  wrap: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  back: {
    display: "inline-block",
    marginBottom: 24,
    color: "#14583f",
    fontWeight: 800,
    textDecoration: "none",
  },
  hero: {
    background: "#ffffff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(28px, 5vw, 56px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
    marginBottom: 24,
  },
  badge: {
    display: "inline-block",
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "9px 16px",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    marginBottom: 18,
  },
  title: {
    margin: 0,
    maxWidth: 850,
    fontSize: "clamp(36px, 7vw, 72px)",
    lineHeight: 0.96,
    letterSpacing: "-.06em",
    fontWeight: 950,
  },
  sub: {
    maxWidth: 700,
    marginTop: 20,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 420px) 1fr",
    gap: 22,
    alignItems: "start",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7dcc7",
    borderRadius: 30,
    padding: 28,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
  },
  previewImage: {
    width: "100%",
    height: 210,
    objectFit: "cover",
    borderRadius: 22,
    marginTop: 18,
    border: "1px solid #e7dcc7",
  },
  summary: {
    marginTop: 22,
    background: "#f7f3ea",
    borderRadius: 24,
    padding: 22,
    color: "#33433c",
    lineHeight: 1.55,
    wordBreak: "break-word",
  },
  nextBox: {
    marginTop: 18,
    background: "#10291f",
    color: "#ffffff",
    borderRadius: 24,
    padding: 22,
    lineHeight: 1.6,
  },
  checkoutBox: {
    background: "#ffffff",
    border: "1px solid #e7dcc7",
    borderRadius: 30,
    padding: 14,
    boxShadow: "0 24px 70px rgba(20, 88, 63, .14)",
    overflow: "hidden",
    minHeight: 650,
  },
  checkoutHeader: {
    padding: "18px 18px 8px",
  },
  checkoutTitle: {
    margin: 0,
    fontSize: 28,
    color: "#10291f",
  },
  checkoutText: {
    marginTop: 8,
    color: "#5f6b66",
  },
};