"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

type Stats = {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  paidAds: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0,
    paidAds: 0,
    revenue: 0,
  });

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email || "";

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    if (!ADMIN_EMAILS.includes(email)) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setAllowed(true);
    await loadStats();
  }

  async function loadStats() {
    const { data, error } = await supabase.from("ad_orders").select("*");

    if (!error && data) {
      const totalAds = data.length;
      const pendingAds = data.filter(
        (ad) => ad.approval_status === "pending_review"
      ).length;
      const approvedAds = data.filter(
        (ad) => ad.approval_status === "approved"
      ).length;
      const paidAds = data.filter((ad) => ad.payment_status === "paid").length;
      const revenue = data.reduce(
        (sum, ad) => sum + Number(ad.amount_total || 0),
        0
      );

      setStats({
        totalAds,
        pendingAds,
        approvedAds,
        paidAds,
        revenue,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) {
    return <main style={styles.page}>Loading admin dashboard...</main>;
  }

  if (!allowed) {
    return (
      <main style={styles.page}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Access Denied</p>
          <h1 style={styles.title}>You are not authorized.</h1>
          <p style={styles.text}>
            This area is only available to approved VendorEventsHub admins.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>
        <h1 style={styles.title}>Command Center</h1>
        <p style={styles.text}>
          Manage paid ads, vendors, organizers, events, payments, approvals, and
          platform operations from one private admin dashboard.
        </p>
      </section>

      <section style={styles.statsGrid}>
        <Stat title="Total Ads" value={stats.totalAds.toString()} />
        <Stat title="Pending Review" value={stats.pendingAds.toString()} />
        <Stat title="Approved Ads" value={stats.approvedAds.toString()} />
        <Stat title="Paid Ads" value={stats.paidAds.toString()} />
        <Stat title="Ad Revenue" value={`$${(stats.revenue / 100).toFixed(2)}`} />
      </section>

      <section style={styles.grid}>
        <AdminCard
          title="Advertising Review"
          desc="Approve, pause, or reject paid advertising placements."
          href="/admin/ads"
        />
        <AdminCard
          title="Events Management"
          desc="Review event listings, featured events, and organizer activity."
          href="/admin/events"
        />
        <AdminCard
          title="Vendors"
          desc="Manage vendor accounts, vendor profiles, and marketplace activity."
          href="/admin/vendors"
        />
        <AdminCard
          title="Users"
          desc="View users, organizers, vendors, and account activity."
          href="/admin/users"
        />
        <AdminCard
          title="Payments"
          desc="Track Stripe payments, paid ads, and revenue history."
          href="/admin/payments"
        />
        <AdminCard
          title="Settings"
          desc="Control admin emails, platform rules, and future system settings."
          href="/admin/settings"
        />
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statTitle}>{title}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

function AdminCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardText}>{desc}</p>
      <span style={styles.cardLink}>Open →</span>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    padding: "40px 18px",
    color: "#10291f",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  hero: {
    maxWidth: 1180,
    margin: "0 auto 26px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(30px, 5vw, 58px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
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
    fontSize: "clamp(42px, 7vw, 80px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },
  text: {
    maxWidth: 760,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  statsGrid: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .15)",
  },
  statTitle: {
    margin: 0,
    color: "#e8ddc7",
    fontWeight: 800,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },
  statValue: {
    margin: "12px 0 0",
    fontSize: 34,
    letterSpacing: "-.04em",
  },
  grid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 26,
    textDecoration: "none",
    color: "#10291f",
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    letterSpacing: "-.04em",
  },
  cardText: {
    color: "#5f6b66",
    lineHeight: 1.65,
  },
  cardLink: {
    display: "inline-block",
    marginTop: 12,
    fontWeight: 900,
    color: "#14583f",
  },
};