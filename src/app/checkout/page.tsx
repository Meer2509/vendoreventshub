"use client";

import { useCallback } from "react";
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

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "homepage";
  const planName = planNames[plan] || "Premium Advertising Plan";

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!data.clientSecret) {
      throw new Error(data.error || "Unable to start checkout.");
    }

    return data.clientSecret;
  }, [plan]);

  return (
    <main style={styles.page}>
      <section style={styles.wrap}>
        <Link href="/pricing" style={styles.back}>← Back to pricing</Link>

        <div style={styles.hero}>
          <div style={styles.badge}>VendorEventsHub Premium</div>
          <h1 style={styles.title}>{planName}</h1>
          <p style={styles.sub}>
            Complete your secure payment for your premium advertising placement.
          </p>

          <div style={styles.trust}>
            <span style={styles.pill}>🔒 Stripe Secure</span>
            <span style={styles.pill}>Encrypted Payment</span>
            <span style={styles.pill}>Instant Confirmation</span>
          </div>
        </div>

        <section style={styles.grid}>
          <aside style={styles.card}>
            <h2 style={styles.cardTitle}>Premium placement summary</h2>
            <p style={styles.text}>
              Your payment is securely processed by Stripe. VendorEventsHub does
              not store your card details.
            </p>

            <div style={styles.summary}>
              <p><strong>Selected Plan</strong><br />{planName}</p>
              <p><strong>Status</strong><br />Pending secure payment</p>
              <p><strong>Next Step</strong><br />Ad review and activation</p>
            </div>
          </aside>

          <div style={styles.checkoutBox}>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#10291f",
    padding: "32px 16px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  wrap: { maxWidth: 1180, margin: "0 auto" },
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
    fontSize: "clamp(38px, 7vw, 76px)",
    lineHeight: .95,
    letterSpacing: "-.06em",
    fontWeight: 950,
  },
  sub: {
    maxWidth: 680,
    marginTop: 20,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  trust: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 },
  pill: {
    background: "#f7f3ea",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 400px) 1fr",
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
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
  },
  text: { color: "#5f6b66", lineHeight: 1.7 },
  summary: {
    marginTop: 22,
    background: "#f7f3ea",
    borderRadius: 24,
    padding: 20,
    color: "#33433c",
    lineHeight: 1.6,
  },
  checkoutBox: {
    background: "#ffffff",
    border: "1px solid #e7dcc7",
    borderRadius: 30,
    padding: 12,
    boxShadow: "0 24px 70px rgba(20, 88, 63, .14)",
    overflow: "hidden",
  },
};