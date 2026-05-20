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
  vendor: "Vendor Directory Feature",
  organizer: "Premium Advertising Placement",
};

function CheckoutContent() {
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan") || "homepage";
  const planName = planNames[plan] || "Premium Advertising Plan";

  const businessName = searchParams.get("business_name") || "Your Business";
  const adTitle = searchParams.get("title") || "Premium Sponsored Placement";
  const adDescription =
    searchParams.get("description") || "Your advertising request";
  const specialNote = searchParams.get("special_note") || "";
  const placement = searchParams.get("placement") || plan;
  const budget = searchParams.get("budget") || "Premium Plan";
  const linkUrl = searchParams.get("link_url") || "Not provided";
  const imageUrl = searchParams.get("image_url") || "";
  const priceId = searchParams.get("price_id") || "";

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        price_id: priceId,
        business_name: businessName,
        title: adTitle,
        description: adDescription,
        special_note: specialNote,
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
    priceId,
    businessName,
    adTitle,
    adDescription,
    specialNote,
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
            Review your advertising request below, then complete secure payment
            inside VendorEventsHub using Stripe.
          </p>

          <div style={styles.trustRow}>
            <span>Secure Stripe Payment</span>
            <span>30-Day Placement</span>
            <span>Reviewed Before Approval</span>
          </div>
        </div>

        <section style={styles.grid}>
          <aside style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <span style={styles.smallBadge}>Order Summary</span>
                <h2 style={styles.cardTitle}>Premium ad request</h2>
              </div>
              <div style={styles.pricePill}>{budget}</div>
            </div>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ad preview"
                style={styles.previewImage}
              />
            )}

            <div style={styles.summary}>
              <div style={styles.summaryItem}>
                <strong>Business Name</strong>
                <span>{businessName}</span>
              </div>

              <div style={styles.summaryItem}>
                <strong>Ad Title</strong>
                <span>{adTitle}</span>
              </div>

              <div style={styles.summaryItem}>
                <strong>Ad Description</strong>
                <span>{adDescription}</span>
              </div>

              {specialNote && (
                <div style={styles.specialNote}>
                  <strong>Special Notes / Instructions</strong>
                  <span>{specialNote}</span>
                </div>
              )}

              <div style={styles.summaryItem}>
                <strong>Placement</strong>
                <span>{placement}</span>
              </div>

              <div style={styles.summaryItem}>
                <strong>Selected Plan</strong>
                <span>{planName}</span>
              </div>

              <div style={styles.summaryItem}>
                <strong>Website Link</strong>
                <span>{linkUrl}</span>
              </div>
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
              <span style={styles.smallBadge}>Secure Payment</span>
              <h2 style={styles.checkoutTitle}>Complete checkout</h2>
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
    background:
      "radial-gradient(circle at top left, rgba(184,138,46,.18), transparent 34%), radial-gradient(circle at top right, rgba(16,41,31,.12), transparent 30%), #f7f1e6",
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
    fontWeight: 900,
    textDecoration: "none",
  },
  hero: {
    background: "rgba(255,255,255,.88)",
    border: "1px solid #eadfc9",
    borderRadius: 36,
    padding: "clamp(30px, 5vw, 60px)",
    boxShadow: "0 30px 90px rgba(20, 88, 63, .13)",
    marginBottom: 24,
    backdropFilter: "blur(12px)",
  },
  badge: {
    display: "inline-block",
    background: "#10291f",
    color: "#ffffff",
    borderRadius: 999,
    padding: "9px 16px",
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    marginBottom: 18,
  },
  smallBadge: {
    display: "inline-block",
    background: "#f7f1e6",
    color: "#10291f",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    margin: 0,
    maxWidth: 880,
    fontSize: "clamp(42px, 7vw, 82px)",
    lineHeight: 0.9,
    letterSpacing: "-.075em",
    fontWeight: 950,
  },
  sub: {
    maxWidth: 700,
    marginTop: 22,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  trustRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 28,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 440px) 1fr",
    gap: 22,
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,.9)",
    border: "1px solid #eadfc9",
    borderRadius: 34,
    padding: 28,
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
    backdropFilter: "blur(12px)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },
  cardTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.02,
    letterSpacing: "-.045em",
  },
  pricePill: {
    background: "#10291f",
    color: "#ffffff",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  previewImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 24,
    marginTop: 20,
    border: "1px solid #eadfc9",
  },
  summary: {
    marginTop: 22,
    background: "#f7f1e6",
    borderRadius: 26,
    padding: 22,
    color: "#33433c",
    wordBreak: "break-word",
  },
  summaryItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: "1px solid #e4d7bf",
  },
  specialNote: {
    background: "#ffffff",
    border: "1px solid #eadfc9",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  nextBox: {
    marginTop: 18,
    background: "#10291f",
    color: "#ffffff",
    borderRadius: 26,
    padding: 22,
    lineHeight: 1.6,
  },
  checkoutBox: {
    background: "rgba(255,255,255,.9)",
    border: "1px solid #eadfc9",
    borderRadius: 34,
    padding: 14,
    boxShadow: "0 30px 90px rgba(20, 88, 63, .14)",
    overflow: "hidden",
    minHeight: 650,
    backdropFilter: "blur(12px)",
  },
  checkoutHeader: {
    padding: "20px 20px 10px",
  },
  checkoutTitle: {
    margin: 0,
    fontSize: 32,
    color: "#10291f",
    letterSpacing: "-.04em",
  },
  checkoutText: {
    marginTop: 8,
    color: "#5f6b66",
  },
};