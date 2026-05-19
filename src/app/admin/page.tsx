"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      if (!ADMIN_EMAILS.includes(data.user.email || "")) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      const [{ data: adRows }, { data: eventRows }, { data: vendorRows }] =
        await Promise.all([
          supabase.from("ad_orders").select("*").order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("created_at", { ascending: false }),
          supabase.from("vendor_profiles").select("*").order("created_at", { ascending: false }),
        ]);

      setAds(adRows || []);
      setEvents(eventRows || []);
      setVendors(vendorRows || []);
      setLoading(false);
    }

    init();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const paidAds = ads.filter((ad) => ad.payment_status === "paid");
    const approvedAds = ads.filter((ad) => ad.approval_status === "approved");
    const pendingAds = ads.filter((ad) => ad.approval_status === "pending_review");
    const pausedAds = ads.filter((ad) => ad.approval_status === "paused");
    const rejectedAds = ads.filter((ad) => ad.approval_status === "rejected");

    const liveAds = ads.filter(
      (ad) =>
        ad.payment_status === "paid" &&
        ad.approval_status === "approved" &&
        ad.expires_at &&
        new Date(ad.expires_at) > now
    );

    const expiringAds = liveAds.filter((ad) => {
      const expires = new Date(ad.expires_at);
      const diffDays = Math.ceil(
        (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 7;
    });

    const totalRevenue = paidAds.reduce(
      (sum, ad) => sum + Number(ad.amount_total || 0),
      0
    );

    const todayRevenue = paidAds
      .filter((ad) => String(ad.created_at || "").startsWith(today))
      .reduce((sum, ad) => sum + Number(ad.amount_total || 0), 0);

    return {
      totalRevenue,
      todayRevenue,
      totalAds: ads.length,
      paidAds: paidAds.length,
      approvedAds: approvedAds.length,
      pendingAds: pendingAds.length,
      pausedAds: pausedAds.length,
      rejectedAds: rejectedAds.length,
      liveAds: liveAds.length,
      expiringAds,
      totalEvents: events.length,
      totalVendors: vendors.length,
    };
  }, [ads, events, vendors]);

  if (loading) {
    return <main style={styles.page}>Loading admin command center...</main>;
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
        <div>
          <p style={styles.eyebrow}>VendorEventsHub Admin</p>
          <h1 style={styles.title}>Command Center</h1>
          <p style={styles.text}>
            Manage platform revenue, paid advertisements, event listings,
            vendors, approvals, and growth operations from one private dashboard.
          </p>
        </div>

        <div style={styles.heroActions}>
          <Link href="/admin/ads" style={styles.goldButton}>Review Ads</Link>
          <Link href="/create-event" style={styles.darkButton}>+ Add Event</Link>
          <Link href="/advertise" style={styles.lightButton}>View Ads Page</Link>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <Stat title="Total Revenue" value={`$${(stats.totalRevenue / 100).toFixed(2)}`} />
        <Stat title="Today Revenue" value={`$${(stats.todayRevenue / 100).toFixed(2)}`} />
        <Stat title="Pending Ads" value={String(stats.pendingAds)} />
        <Stat title="Live Ads" value={String(stats.liveAds)} />
        <Stat title="Events" value={String(stats.totalEvents)} />
        <Stat title="Vendors" value={String(stats.totalVendors)} />
      </section>

      <section style={styles.panelGrid}>
        <Panel title="Advertising Health">
          <Metric label="Total ad orders" value={stats.totalAds} />
          <Metric label="Paid ads" value={stats.paidAds} />
          <Metric label="Approved ads" value={stats.approvedAds} />
          <Metric label="Paused ads" value={stats.pausedAds} />
          <Metric label="Rejected ads" value={stats.rejectedAds} />
        </Panel>

        <Panel title="Quick Actions">
          <QuickLink href="/admin/ads" text="Approve pending ads" />
          <QuickLink href="/admin/payments" text="Review payment history" />
          <QuickLink href="/admin/events" text="Manage events" />
          <QuickLink href="/admin/vendors" text="Manage vendors" />
          <QuickLink href="/admin/settings" text="Platform settings" />
        </Panel>

        <Panel title="Expiring Soon">
          {stats.expiringAds.length === 0 ? (
            <p style={styles.muted}>No approved ads expiring in the next 7 days.</p>
          ) : (
            stats.expiringAds.slice(0, 5).map((ad) => (
              <div key={ad.id} style={styles.smallCard}>
                <strong>{ad.business_name}</strong>
                <span>{ad.placement}</span>
                <span>
                  Expires:{" "}
                  {ad.expires_at
                    ? new Date(ad.expires_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            ))
          )}
        </Panel>
      </section>

      <section style={styles.twoCol}>
        <div style={styles.tablePanel}>
          <div style={styles.panelHeader}>
            <h2>Recent Paid Ads</h2>
            <Link href="/admin/ads" style={styles.panelLink}>View all →</Link>
          </div>

          {ads.length === 0 ? (
            <p style={styles.muted}>No ad orders yet.</p>
          ) : (
            ads.slice(0, 6).map((ad) => (
              <div key={ad.id} style={styles.row}>
                <div>
                  <strong>{ad.business_name || "Unknown Business"}</strong>
                  <p>{ad.ad_title || "Sponsored Placement"}</p>
                </div>
                <div style={styles.rowRight}>
                  <span style={styles.badge}>{ad.approval_status}</span>
                  <strong>${((ad.amount_total || 0) / 100).toFixed(2)}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.tablePanel}>
          <div style={styles.panelHeader}>
            <h2>Platform Snapshot</h2>
          </div>

          <div style={styles.snapshotGrid}>
            <Snapshot label="Paid placements" value={stats.paidAds} />
            <Snapshot label="Waiting review" value={stats.pendingAds} />
            <Snapshot label="Approved live" value={stats.liveAds} />
            <Snapshot label="Events listed" value={stats.totalEvents} />
            <Snapshot label="Vendor profiles" value={stats.totalVendors} />
            <Snapshot label="Rejected ads" value={stats.rejectedAds} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.statCard}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} style={styles.quickLink}>
      {text} →
    </Link>
  );
}

function Snapshot({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.snapshot}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    padding: "34px 18px",
    color: "#10291f",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  hero: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(28px, 5vw, 56px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 24,
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
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  goldButton: {
    background: "#e8ddc7",
    color: "#10291f",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    textDecoration: "none",
  },
  darkButton: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    textDecoration: "none",
  },
  lightButton: {
    background: "#f7f3ea",
    color: "#14583f",
    borderRadius: 999,
    padding: "14px 18px",
    fontWeight: 900,
    textDecoration: "none",
  },
  statsGrid: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
    gap: 14,
  },
  statCard: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .15)",
  },
  panelGrid: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  panelTitle: {
    margin: "0 0 16px",
    fontSize: 28,
    letterSpacing: "-.04em",
  },
  metric: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #eee5d6",
  },
  quickLink: {
    display: "block",
    padding: "14px 0",
    color: "#14583f",
    fontWeight: 900,
    textDecoration: "none",
    borderBottom: "1px solid #eee5d6",
  },
  muted: {
    color: "#5f6b66",
  },
  smallCard: {
    display: "grid",
    gap: 4,
    background: "#f7f3ea",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  twoCol: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 18,
  },
  tablePanel: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  panelLink: {
    color: "#14583f",
    fontWeight: 900,
    textDecoration: "none",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    borderTop: "1px solid #eee5d6",
    padding: "14px 0",
  },
  rowRight: {
    display: "grid",
    justifyItems: "end",
    gap: 6,
  },
  badge: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  snapshotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
  },
  snapshot: {
    background: "#f7f3ea",
    borderRadius: 18,
    padding: 16,
    display: "grid",
    gap: 6,
  },
};