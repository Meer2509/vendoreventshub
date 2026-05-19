"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminUsersPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return (window.location.href = "/login");

      setAllowed(ADMIN_EMAILS.includes(data.user.email || ""));
      setLoading(false);
    }

    init();
  }, []);

  if (loading) return <main style={styles.page}>Loading users...</main>;
  if (!allowed) return <main style={styles.page}>Access denied.</main>;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Admin Users</p>
        <h1 style={styles.title}>Users</h1>
        <p style={styles.text}>
          User management will connect to a secure server-side admin API next.
        </p>
      </section>

      <section style={styles.card}>
        For security, Supabase Auth users should be loaded through a protected
        server admin route, not directly from the browser.
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
  card: { maxWidth: 1100, margin: "0 auto", background: "#fff", padding: 22, borderRadius: 24 },
};