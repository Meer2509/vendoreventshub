"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminPaymentsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return (window.location.href = "/login");

      if (!ADMIN_EMAILS.includes(data.user.email || "")) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      const { data: rows } = await supabase
        .from("ad_orders")
        .select("*")
        .order("created_at", { ascending: false });

      setPayments(rows || []);
      setLoading(false);
    }

    init();
  }, []);

  if (loading) return <main style={styles.page}>Loading payments...</main>;
  if (!allowed) return <main style={styles.page}>Access denied.</main>;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Admin Payments</p>
        <h1 style={styles.title}>Payment History</h1>
        <p style={styles.text}>Track Stripe-paid advertising orders.</p>
      </section>

      <section style={styles.list}>
        {payments.length === 0 ? (
          <div style={styles.card}>No payments yet.</div>
        ) : (
          payments.map((p) => (
            <div key={p.id} style={styles.card}>
              <h2>{p.business_name}</h2>
              <p><strong>Amount:</strong> ${((p.amount_total || 0) / 100).toFixed(2)}</p>
              <p><strong>Status:</strong> {p.payment_status}</p>
              <p><strong>Placement:</strong> {p.placement}</p>
              <p><strong>Email:</strong> {p.customer_email || "N/A"}</p>
              <p><strong>Created:</strong> {new Date(p.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f3ea", padding: 24, color: "#10291f" },
  hero: { maxWidth: 1100, margin: "0 auto 24px", background: "#fff", padding: 34, borderRadius: 30 },
  eyebrow: { color: "#14583f", fontWeight: 900, textTransform: "uppercase" },
  title: { fontSize: 56, margin: 0 },
  text: { color: "#5f6b66" },
  list: { maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 },
  card: { background: "#fff", padding: 22, borderRadius: 24, border: "1px solid #e7dcc7" },
};