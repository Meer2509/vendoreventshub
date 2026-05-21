"use client";

import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  approveAdOrderViaApi,
  detectColumns,
  formatAdminMoney,
  isMissingColumnError,
  isRlsOrPermissionError,
  missingColumnAlert,
  missingTableAlert,
  runAdminMutation,
} from "@/lib/admin";
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
  const [actingId, setActingId] = useState<string | null>(null);
  const [hasApprovalColumn, setHasApprovalColumn] = useState(true);

  async function loadAds() {
    setLoading(true);

    const { data, error } = await supabase
      .from("ad_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin] load ad_orders:", error);
      setTableMissing(true);
      setAds([]);
      if (error.message.includes("does not exist")) {
        alert(missingTableAlert("ad_orders"));
      }
    } else {
      setTableMissing(false);
      const rows = (data as AdOrder[]) || [];
      setAds(rows);
      if (rows.length > 0) {
        const cols = detectColumns(
          rows as unknown as Record<string, unknown>[],
          ["approval_status"]
        );
        setHasApprovalColumn(cols.approval_status);
      }
    }

    setLoading(false);
  }

  function patchAdStatus(id: string, approval_status: string) {
    setAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, approval_status } : ad))
    );
  }

  async function approveAd(id: string) {
    setActingId(id);

    const onDone = async () => {
      patchAdStatus(id, "approved");
      await loadAds();
    };

    const { error } = await supabase
      .from("ad_orders")
      .update({ approval_status: "approved" })
      .eq("id", id);

    if (!error) {
      console.log("[Admin] Approve ad: ad_orders.approval_status = approved", id);
      alert("Approve ad succeeded.");
      await onDone();
      setActingId(null);
      return;
    }

    console.error("[Admin] Approve ad failed (ad_orders.approval_status):", error);

    if (!hasApprovalColumn || isMissingColumnError(error.message)) {
      alert(missingColumnAlert("ad_orders", "approval_status"));
    } else if (isRlsOrPermissionError(error.message)) {
      await approveAdOrderViaApi(id, onDone);
    } else {
      alert(`Approve ad failed: ${error.message}`);
    }

    setActingId(null);
  }

  async function updateStatus(id: string, status: string) {
    setActingId(id);

    const label =
      status === "paused"
        ? "Pause ad"
        : status === "rejected"
        ? "Reject ad"
        : "Update ad";

    const ok = await runAdminMutation({
      actionLabel: label,
      table: "ad_orders",
      column: "approval_status",
      hasColumn: hasApprovalColumn,
      run: async () =>
        supabase
          .from("ad_orders")
          .update({ approval_status: status })
          .eq("id", id),
      onSuccess: async () => {
        patchAdStatus(id, status);
        await loadAds();
      },
    });

    if (!ok) {
      const { error } = await supabase
        .from("ad_orders")
        .update({ approval_status: status })
        .eq("id", id);

      if (error && isRlsOrPermissionError(error.message) && status !== "approved") {
        const token = await import("@/lib/admin").then((m) => m.getAdminAccessToken());
        if (token) {
          const res = await fetch("/api/update-ad-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id, status }),
          });
          const data = await res.json();
          if (res.ok) {
            alert(`${label} succeeded.`);
            patchAdStatus(id, status);
            await loadAds();
          } else {
            alert(data.error || `${label} failed.`);
          }
        }
      }
    }

    setActingId(null);
  }

  async function renewAd(adId: string) {
    try {
      setActingId(adId);

      const res = await fetch("/api/create-renewal-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        alert(data.error || "Renewal checkout failed.");
        setActingId(null);
        return;
      }

      window.location.href = `/checkout-renew?client_secret=${encodeURIComponent(
        data.clientSecret
      )}`;
    } catch (err) {
      console.error("[Admin] renew ad:", err);
      alert("Something went wrong starting renewal checkout.");
      setActingId(null);
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
          <p className="adminMuted">{missingTableAlert("ad_orders")}</p>
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
          Approve updates <code>ad_orders.approval_status</code> to{" "}
          <code>approved</code> via Supabase (API fallback if RLS blocks).
        </p>
        {!hasApprovalColumn && (
          <p className="adminMuted">
            Missing <code>ad_orders.approval_status</code> — Approve is disabled.
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
                const busy = actingId === ad.id;

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
                        {(ad.approval_status === "pending_review" ||
                          ad.approval_status === "paused" ||
                          ad.approval_status === "rejected") && (
                          <button
                            type="button"
                            className="adminBtn adminBtnGold"
                            disabled={!hasApprovalColumn || busy}
                            onClick={() => approveAd(ad.id)}
                          >
                            {busy ? "…" : "Approve"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={!hasApprovalColumn || busy}
                          onClick={() => updateStatus(ad.id, "paused")}
                        >
                          Pause
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnDanger"
                          disabled={!hasApprovalColumn || busy}
                          onClick={() => updateStatus(ad.id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={busy}
                          onClick={() => renewAd(ad.id)}
                        >
                          {busy ? "…" : "Renew"}
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
