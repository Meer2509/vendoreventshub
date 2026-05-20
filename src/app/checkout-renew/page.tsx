"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function RenewCheckoutContent() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("client_secret") || "";

  if (!clientSecret) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>Missing renewal session.</h1>
          <p>Please return to admin ads and try again.</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.wrap}>
        <div style={styles.hero}>
          <p style={styles.badge}>VendorEventsHub Renewal</p>
          <h1 style={styles.title}>Renew this ad for another 30 days.</h1>
          <p style={styles.text}>
            Complete secure Stripe payment below. After payment, this ad will be
            extended for another 30 days and remain approved.
          </p>
        </div>

        <div style={styles.checkoutBox}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </section>
    </main>
  );
}

export default function RenewCheckoutPage() {
  return (
    <Suspense fallback={<main style={styles.page}>Loading renewal checkout...</main>}>
      <RenewCheckoutContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#10291f",
    padding: "34px 18px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  wrap: {
    maxWidth: 900,
    margin: "0 auto",
  },
  hero: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(28px, 5vw, 56px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
    marginBottom: 24,
  },
  badge: {
    color: "#14583f",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".16em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    fontSize: "clamp(38px, 7vw, 70px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },
  text: {
    maxWidth: 680,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  checkoutBox: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 30,
    padding: 14,
    boxShadow: "0 24px 70px rgba(20, 88, 63, .14)",
    overflow: "hidden",
    minHeight: 650,
  },
  card: {
    maxWidth: 700,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 30,
    padding: 34,
  },
};