"use client";

import { useEffect, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { supabase } from "@/lib/supabase";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [tableMissing, setTableMissing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase
        .from("ad_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setTableMissing(true);
        setPayments([]);
      } else {
        setPayments(data || []);
      }

      setLoading(false);
    }

    init();
  }, []);

  const paid = payments.filter((p) => p.payment_status === "paid");
  const revenue = paid.reduce((sum, p) => sum + Number(p.amount_total || 0), 0);

  if (loading) {
    return (
      <main className="adminPage">
        <p className="adminMuted">Loading payments...</p>
      </main>
    );
  }

  if (tableMissing) {
    return (
      <main className="adminPage">
        <PremiumEmptyState
          eyebrow="Payments"
          title="Ad orders table not connected"
          description="Create the ad_orders table and Stripe webhook to track premium ad revenue here."
          actionLabel="View Ads Admin"
          onAction={() => (window.location.href = "/admin/ads")}
        />
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Payments</p>
        <h1>Revenue from paid placements</h1>
        <p className="adminMuted">
          Stripe-paid ad orders only — no fabricated revenue numbers.
        </p>
      </section>

      <div className="adminStatsGrid">
        <div className="adminStatCard">
          <p>Total paid revenue</p>
          <strong>${(revenue / 100).toFixed(2)}</strong>
        </div>
        <div className="adminStatCard">
          <p>Paid orders</p>
          <strong>{paid.length}</strong>
        </div>
        <div className="adminStatCard">
          <p>All orders</p>
          <strong>{payments.length}</strong>
        </div>
      </div>

      <section className="adminPanel">
        {payments.length === 0 ? (
          <PremiumEmptyState
            title="No payments yet"
            description="When vendors or businesses purchase sponsored placements, they will appear here."
            actionLabel="Review Ads"
            onAction={() => (window.location.href = "/admin/ads")}
          />
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.business_name || "—"}</td>
                  <td>{p.payment_status}</td>
                  <td>${((p.amount_total || 0) / 100).toFixed(2)}</td>
                  <td>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
