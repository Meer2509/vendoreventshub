"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminSettingsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const isAdmin = ADMIN_EMAILS.includes(
        data.user.email || ""
      );

      setAllowed(isAdmin);
      setAdminEmail(data.user.email || "");
      setLoading(false);
    }

    init();
  }, []);

  if (loading) {
    return (
      <main style={styles.page}>
        Loading platform settings...
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={styles.page}>
        Access denied.
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>
            VendorEventsHub Admin
          </p>

          <h1 style={styles.title}>
            Platform Settings
          </h1>

          <p style={styles.text}>
            Configure marketplace rules,
            advertising policies, moderation
            standards, admin permissions, and
            platform operations.
          </p>
        </div>

        <div style={styles.heroActions}>
          <Link
            href="/admin"
            style={styles.darkButton}
          >
            Admin Dashboard
          </Link>

          <Link
            href="/admin/ads"
            style={styles.goldButton}
          >
            Review Ads
          </Link>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Admin Access
          </h2>

          <div style={styles.settingCard}>
            <strong>Primary Admin</strong>
            <p>{adminEmail}</p>
          </div>

          <div style={styles.settingCard}>
            <strong>Admin Protection</strong>
            <p>
              Only approved admin emails can
              access the VendorEventsHub
              control center.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Login Security</strong>
            <p>
              Supabase authentication protects
              all admin routes.
            </p>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Advertising Rules
          </h2>

          <div style={styles.settingCard}>
            <strong>Ad Approval</strong>
            <p>
              All advertisements require manual
              admin approval before appearing
              live.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Ad Duration</strong>
            <p>
              Sponsored placements remain live
              for <strong>30 days</strong> after
              approval.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Payment Requirement</strong>
            <p>
              Only ads marked{" "}
              <strong>paid</strong> and{" "}
              <strong>approved</strong> appear on
              homepage, events, and vendors
              pages.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Placement Types</strong>
            <p>
              Homepage • Events • Event Detail
              • Vendor Directory • Dashboard •
              Category Sponsor
            </p>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Marketplace Rules
          </h2>

          <div style={styles.settingCard}>
            <strong>Vendor Quality</strong>
            <p>
              Vendors can be featured,
              verified, hidden, or removed by
              admin.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Organizer Quality</strong>
            <p>
              Organizers and events can be
              verified, featured, paused, or
              removed.
            </p>
          </div>

          <div style={styles.settingCard}>
            <strong>Fraud Prevention</strong>
            <p>
              Spam, fake businesses, scam
              events, misleading advertising,
              and low-quality listings should
              be removed.
            </p>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            Quick Admin Actions
          </h2>

          <div style={styles.actionGrid}>
            <Link
              href="/admin/ads"
              style={styles.actionButton}
            >
              Review Ads
            </Link>

            <Link
              href="/admin/events"
              style={styles.actionButton}
            >
              Manage Events
            </Link>

            <Link
              href="/admin/vendors"
              style={styles.actionButton}
            >
              Manage Vendors
            </Link>

            <Link
              href="/admin/payments"
              style={styles.actionButton}
            >
              Payments
            </Link>

            <Link
              href="/advertise"
              style={styles.actionButton}
            >
              Ads Page
            </Link>

            <Link
              href="/"
              style={styles.actionButton}
            >
              Live Website
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.futurePanel}>
        <p style={styles.eyebrow}>
          Future Controls
        </p>

        <h2 style={styles.futureTitle}>
          Billion-Dollar Platform Features
        </h2>

        <div style={styles.futureGrid}>
          <div style={styles.futureCard}>
            <strong>AI Fraud Detection</strong>
            <p>
              Detect fake vendors and spam
              organizers automatically.
            </p>
          </div>

          <div style={styles.futureCard}>
            <strong>Email Campaigns</strong>
            <p>
              Send platform announcements to
              vendors and organizers.
            </p>
          </div>

          <div style={styles.futureCard}>
            <strong>Auto Renew Ads</strong>
            <p>
              Allow advertisers to renew
              placements instantly.
            </p>
          </div>

          <div style={styles.futureCard}>
            <strong>Analytics Engine</strong>
            <p>
              Real vendor traffic, booth ROI,
              and event intelligence.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    padding: "34px 18px",
    color: "#10291f",
    fontFamily:
      "Inter, system-ui, sans-serif",
  },

  hero: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding:
      "clamp(28px, 5vw, 56px)",
    boxShadow:
      "0 24px 70px rgba(20,88,63,.12)",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },

  eyebrow: {
    color: "#14583f",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".16em",
    fontSize: 12,
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(42px, 7vw, 76px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },

  text: {
    maxWidth: 720,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },

  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "start",
  },

  darkButton: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    textDecoration: "none",
  },

  goldButton: {
    background: "#e8ddc7",
    color: "#10291f",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    textDecoration: "none",
  },

  grid: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },

  panel: {
    background: "#fff",
    borderRadius: 28,
    padding: 24,
    border: "1px solid #e7dcc7",
    boxShadow:
      "0 20px 55px rgba(20,88,63,.10)",
  },

  panelTitle: {
    margin: "0 0 18px",
    fontSize: 28,
    letterSpacing: "-.04em",
  },

  settingCard: {
    background: "#f7f3ea",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    lineHeight: 1.7,
  },

  actionGrid: {
    display: "grid",
    gap: 12,
  },

  actionButton: {
    background: "#14583f",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 16px",
    borderRadius: 18,
    fontWeight: 900,
    textAlign: "center",
  },

  futurePanel: {
    maxWidth: 1180,
    margin: "0 auto",
    background: "#10291f",
    color: "#fff",
    borderRadius: 34,
    padding:
      "clamp(28px, 5vw, 56px)",
  },

  futureTitle: {
    fontSize:
      "clamp(36px, 6vw, 60px)",
    marginTop: 0,
    letterSpacing: "-.05em",
  },

  futureGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },

  futureCard: {
    background:
      "rgba(255,255,255,.08)",
    borderRadius: 24,
    padding: 20,
    border:
      "1px solid rgba(255,255,255,.12)",
  },
};