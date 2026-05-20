"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

type AdOrder = {
  id: string;
  business_name: string;
  ad_title: string;
  ad_description: string;
  link_url: string;
  image_url: string;
  placement: string;
  plan: string;
  budget: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  approval_status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [renewingId, setRenewingId] = useState("");

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
    loadAds();
  }

  async function loadAds() {
    setLoading(true);

    const { data, error } = await supabase
      .from("ad_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setAds(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/update-ad-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      alert(data.error || "Could not update ad status.");
      return;
    }
  
    alert(
      status === "approved"
        ? "Ad approved and customer email sent."
        : status === "rejected"
        ? "Ad rejected and customer email sent."
        : status === "paused"
        ? "Ad paused and customer email sent."
        : "Ad status updated."
    );
  
    loadAds();
  }

  async function renewAd(adId: string) {
    try {
      setRenewingId(adId);

      const res = await fetch("/api/create-renewal-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        alert(data.error || "Renewal checkout failed.");
        setRenewingId("");
        return;
      }

      window.location.href = `/checkout-renew?client_secret=${encodeURIComponent(
        data.clientSecret
      )}`;
    } catch (error) {
      alert("Something went wrong starting renewal checkout.");
      setRenewingId("");
    }
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) return <main style={styles.page}>Loading admin ads...</main>;

  if (!allowed) {
    return (
      <main style={styles.page}>
        <section style={styles.header}>
          <p style={styles.eyebrow}>Access Denied</p>
          <h1 style={styles.title}>You are not authorized.</h1>
          <p style={styles.subtitle}>
            This admin page is only available to approved VendorEventsHub admins.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>
        <h1 style={styles.title}>Paid Advertising Review</h1>
        <p style={styles.subtitle}>
          Review paid advertiser submissions, approve placements, reject bad ads,
          pause active ads, or renew approved placements for another 30 days.
        </p>
      </section>

      {ads.length === 0 ? (
        <div style={styles.empty}>No paid ad orders yet.</div>
      ) : (
        <section style={styles.grid}>
          {ads.map((ad) => {
            const isExpired =
              ad.expires_at && new Date(ad.expires_at) < new Date();

            return (
              <article key={ad.id} style={styles.card}>
                {ad.image_url && (
                  <img src={ad.image_url} alt={ad.ad_title} style={styles.image} />
                )}

                <div style={styles.topRow}>
                  <span style={styles.status}>{ad.approval_status}</span>
                  <span style={styles.payment}>{ad.payment_status}</span>
                  {isExpired && <span style={styles.expired}>Expired</span>}
                </div>

                <h2 style={styles.cardTitle}>{ad.ad_title}</h2>
                <p style={styles.business}>{ad.business_name}</p>
                <p style={styles.desc}>{ad.ad_description}</p>

                <div style={styles.infoBox}>
                  <p><strong>Placement:</strong> {ad.placement}</p>
                  <p><strong>Plan:</strong> {ad.plan}</p>
                  <p><strong>Budget:</strong> {ad.budget}</p>
                  <p><strong>Paid:</strong> ${((ad.amount_total || 0) / 100).toFixed(2)}</p>
                  <p>
                    <strong>Starts:</strong>{" "}
                    {ad.starts_at ? new Date(ad.starts_at).toLocaleDateString() : "N/A"}
                  </p>
                  <p>
                    <strong>Expires:</strong>{" "}
                    {ad.expires_at ? new Date(ad.expires_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                {ad.link_url && (
                  <a href={ad.link_url} target="_blank" style={styles.link}>
                    Visit advertiser website →
                  </a>
                )}

                <div style={styles.actions}>
                  <button
                    style={styles.approve}
                    onClick={() => updateStatus(ad.id, "approved")}
                  >
                    Approve
                  </button>

                  <button
                    style={styles.pause}
                    onClick={() => updateStatus(ad.id, "paused")}
                  >
                    Pause
                  </button>

                  <button
                    style={styles.reject}
                    onClick={() => updateStatus(ad.id, "rejected")}
                  >
                    Reject
                  </button>

                  <button
                    style={styles.renew}
                    onClick={() => renewAd(ad.id)}
                    disabled={renewingId === ad.id}
                  >
                    {renewingId === ad.id ? "Opening..." : "Renew 30 Days"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
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
  header: {
    maxWidth: 1100,
    margin: "0 auto 28px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(28px, 5vw, 54px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
  },
  eyebrow: {
    color: "#14583f",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".14em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    fontSize: "clamp(38px, 7vw, 72px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },
  subtitle: {
    maxWidth: 700,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },
  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  image: {
    width: "100%",
    height: 190,
    objectFit: "cover",
    borderRadius: 20,
    marginBottom: 16,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  status: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
  },
  payment: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
  },
  expired: {
    background: "#8b1e1e",
    color: "#fff",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
  },
  business: {
    color: "#14583f",
    fontWeight: 900,
  },
  desc: {
    color: "#5f6b66",
    lineHeight: 1.6,
  },
  infoBox: {
    background: "#f7f3ea",
    borderRadius: 20,
    padding: 16,
    lineHeight: 1.6,
    marginTop: 14,
    wordBreak: "break-word",
  },
  link: {
    display: "inline-block",
    marginTop: 16,
    color: "#14583f",
    fontWeight: 900,
    textDecoration: "none",
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 18,
  },
  approve: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#14583f",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  pause: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#e8ddc7",
    color: "#10291f",
    fontWeight: 900,
    cursor: "pointer",
  },
  reject: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#8b1e1e",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  renew: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#10291f",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  empty: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 30,
    color: "#5f6b66",
  },
};