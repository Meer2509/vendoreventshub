"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { formatAdminMoney, getAdminAccessToken } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

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
  payment_status: string;
  approval_status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tableMissing, setTableMissing] = useState(false);
  const [apiReady, setApiReady] = useState(true);
  const [renewingId, setRenewingId] = useState("");

  async function loadAds() {
    setLoading(true);

    const { data, error } = await supabase
      .from("ad_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setTableMissing(true);
      setAds([]);
    } else {
      setTableMissing(false);
      setAds((data as AdOrder[]) || []);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const token = await getAdminAccessToken();

    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const res = await fetch("/api/update-ad-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      setApiReady(false);
      alert(
        data.error ||
          "Could not update ad status. Ensure SUPABASE_SERVICE_ROLE_KEY is set on the server."
      );
      return;
    }

    setApiReady(true);
    await loadAds();
  }

  async function renewAd(adId: string) {
    try {
      setRenewingId(adId);

      const res = await fetch("/api/create-renewal-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch {
      alert("Something went wrong starting renewal checkout.");
      setRenewingId("");
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ads.filter((ad) => {
      if (!q) return true;
      return (
        ad.business_name?.toLowerCase().includes(q) ||
        ad.ad_title?.toLowerCase().includes(q) ||
        ad.approval_status?.toLowerCase().includes(q) ||
        ad.id.toLowerCase().includes(q)
      );
    });
  }, [ads, search]);

  if (loading) {
    return (
      <main className="adminPage">
        <p className="adminMuted">Loading ads...</p>
      </main>
    );
  }

  if (tableMissing) {
    return (
      <main className="adminPage">
        <section className="adminHero">
          <p className="adminEyebrow">Ads</p>
          <h1>Sponsored placements</h1>
          <p className="adminMuted">
            The <code>ad_orders</code> table is not available. Create it in Supabase
            to enable approve/reject workflows.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Ads</p>
        <h1>Paid advertising review</h1>
        <p className="adminMuted">
          Approve, reject, pause, or re-open ads. Status updates use the secure
          admin API (service role + admin session).
        </p>
        {!apiReady && (
          <p className="adminMuted">
            Server API may be misconfigured. Set{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment.
          </p>
        )}
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search business, title, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="adminBtn adminBtnSecondary" onClick={loadAds}>
          Refresh
        </button>
      </div>

      <section className="adminPanel">
        {filtered.length === 0 ? (
          <PremiumEmptyState
            title="No paid ad orders"
            description="When businesses purchase sponsored placements, they appear here."
          />
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ad) => {
                const isExpired =
                  ad.expires_at && new Date(ad.expires_at) < new Date();

                return (
                  <tr key={ad.id}>
                    <td>
                      <strong>{ad.ad_title || "Sponsored Placement"}</strong>
                      <br />
                      <span className="adminMuted">{ad.business_name}</span>
                      <br />
                      <span className="adminMuted">{ad.placement}</span>
                    </td>
                    <td>
                      <div className="adminBadgeRow">
                        <span className="adminBadge">{ad.approval_status}</span>
                        <span className="adminBadge">{ad.payment_status}</span>
                        {isExpired && <span className="adminBadge">Expired</span>}
                      </div>
                    </td>
                    <td>{formatAdminMoney(ad.amount_total || 0)}</td>
                    <td>
                      <div className="adminActions">
                        {ad.link_url ? (
                          <a
                            href={ad.link_url}
                            className="adminBtn adminBtnSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="adminBtn adminBtnSecondary"
                            disabled
                            title="No destination URL"
                          >
                            Open
                          </button>
                        )}
                        {ad.approval_status === "pending_review" ? (
                          <button
                            type="button"
                            className="adminBtn adminBtnGold"
                            onClick={() => updateStatus(ad.id, "approved")}
                          >
                            Approve
                          </button>
                        ) : ad.approval_status === "paused" ||
                          ad.approval_status === "rejected" ? (
                          <button
                            type="button"
                            className="adminBtn adminBtnGold"
                            onClick={() => updateStatus(ad.id, "approved")}
                          >
                            Open
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          onClick={() => updateStatus(ad.id, "paused")}
                        >
                          Pause
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnDanger"
                          onClick={() => updateStatus(ad.id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={renewingId === ad.id}
                          onClick={() => renewAd(ad.id)}
                        >
                          {renewingId === ad.id ? "…" : "Renew"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
