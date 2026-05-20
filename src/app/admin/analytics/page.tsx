"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminAnalyticsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

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

      const [{ data: adRows }, { data: analyticsRows }] = await Promise.all([
        supabase.from("ad_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_analytics").select("*").order("created_at", { ascending: false }),
      ]);

      setAds(adRows || []);
      setAnalytics(analyticsRows || []);
      setLoading(false);
    }

    init();
  }, []);

  const report = useMemo(() => {
    return ads.map((ad) => {
      const rows = analytics.filter((item) => item.ad_id === ad.id);
      const views = rows.filter((item) => item.event_type === "view").length;
      const clicks = rows.filter((item) => item.event_type === "click").length;
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";

      return { ad, views, clicks, ctr };
    });
  }, [ads, analytics]);

  const totals = useMemo(() => {
    const views = analytics.filter((item) => item.event_type === "view").length;
    const clicks = analytics.filter((item) => item.event_type === "click").length;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";

    return { views, clicks, ctr };
  }, [analytics]);

  if (loading) return <main style={styles.page}>Loading analytics...</main>;
  if (!allowed) return <main style={styles.page}>Access denied.</main>;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>
        <h1 style={styles.title}>Ad Analytics</h1>
        <p style={styles.text}>
          Track sponsored ad views, clicks, click-through rate, placement
          performance, and advertiser engagement.
        </p>
      </section>

      <section style={styles.statsGrid}>
        <Stat title="Total Views" value={totals.views} />
        <Stat title="Total Clicks" value={totals.clicks} />
        <Stat title="Average CTR" value={`${totals.ctr}%`} />
        <Stat title="Tracked Ads" value={report.length} />
      </section>

      <section style={styles.list}>
        {report.length === 0 ? (
          <div style={styles.card}>No analytics yet.</div>
        ) : (
          report.map(({ ad, views, clicks, ctr }) => (
            <article key={ad.id} style={styles.card}>
              <div style={styles.topRow}>
                <span style={styles.badge}>{ad.placement}</span>
                <span style={styles.status}>{ad.approval_status}</span>
              </div>

              <h2 style={styles.subject}>{ad.business_name}</h2>
              <p style={styles.meta}>{ad.ad_title}</p>

              <div style={styles.miniGrid}>
                <div>
                  <strong>{views}</strong>
                  <span>Views</span>
                </div>
                <div>
                  <strong>{clicks}</strong>
                  <span>Clicks</span>
                </div>
                <div>
                  <strong>{ctr}%</strong>
                  <span>CTR</span>
                </div>
                <div>
                  <strong>${((ad.amount_total || 0) / 100).toFixed(2)}</strong>
                  <span>Revenue</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.statCard}>
      <p>{title}</p>
      <h2>{value}</h2>
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
    boxShadow: "0 24px 70px rgba(20,88,63,.12)",
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
    fontSize: "clamp(42px, 7vw, 76px)",
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
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  statCard: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 26,
    padding: 22,
  },
  list: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 16px 40px rgba(20,88,63,.08)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  status: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  subject: {
    margin: 0,
    fontSize: 26,
    letterSpacing: "-.04em",
  },
  meta: {
    color: "#5f6b66",
  },
  miniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
};