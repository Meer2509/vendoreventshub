"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminEmailsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { user } = await getAuthUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email || "")) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      const { data: rows, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) alert(error.message);
      else setLogs(rows || []);

      setLoading(false);
    }

    init();
  }, []);

  if (loading) return <main style={styles.page}>Loading email logs...</main>;
  if (!allowed) return <main style={styles.page}>Access denied.</main>;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>
        <h1 style={styles.title}>Email Logs</h1>
        <p style={styles.text}>
          Track payment, approval, rejection, pause, and renewal emails sent from
          VendorEventsHub.
        </p>
      </section>

      <section style={styles.list}>
        {logs.length === 0 ? (
          <div style={styles.card}>No emails logged yet.</div>
        ) : (
          logs.map((log) => (
            <article key={log.id} style={styles.card}>
              <div style={styles.topRow}>
                <span
                  style={{
                    ...styles.badge,
                    background:
                      log.status === "sent"
                        ? "#14583f"
                        : log.status === "failed"
                        ? "#8b1e1e"
                        : "#e8ddc7",
                    color: log.status === "skipped" ? "#10291f" : "#fff",
                  }}
                >
                  {log.status}
                </span>

                <span style={styles.type}>{log.email_type || "general"}</span>
              </div>

              <h2 style={styles.subject}>{log.subject}</h2>

              <p style={styles.meta}>
                <strong>To:</strong> {log.email_to || "N/A"}
              </p>

              <p style={styles.meta}>
                <strong>Date:</strong>{" "}
                {log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "N/A"}
              </p>

              {log.related_ad_id && (
                <p style={styles.meta}>
                  <strong>Related Ad:</strong> {log.related_ad_id}
                </p>
              )}

              {log.error_message && (
                <div style={styles.errorBox}>
                  <strong>Error:</strong>
                  <p>{log.error_message}</p>
                </div>
              )}
            </article>
          ))
        )}
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
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  type: {
    background: "#f7f3ea",
    color: "#14583f",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  subject: {
    margin: 0,
    fontSize: 24,
    letterSpacing: "-.04em",
  },
  meta: {
    color: "#5f6b66",
    wordBreak: "break-word",
  },
  errorBox: {
    marginTop: 14,
    background: "#fff0f0",
    border: "1px solid #f3bcbc",
    borderRadius: 18,
    padding: 14,
    color: "#8b1e1e",
  },
};