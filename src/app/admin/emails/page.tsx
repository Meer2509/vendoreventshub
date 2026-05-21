"use client";

import { useEffect, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { supabase } from "@/lib/supabase";

export default function AdminEmailsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [tableMissing, setTableMissing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setTableMissing(true);
        setLogs([]);
      } else {
        setLogs((data as Record<string, unknown>[]) || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="adminPage">
        <p className="adminMuted">Loading email logs...</p>
      </main>
    );
  }

  if (tableMissing) {
    return (
      <main className="adminPage">
        <section className="adminHero">
          <p className="adminEyebrow">Email Logs</p>
          <h1>Outbound email history</h1>
          <p className="adminMuted">
            Create an <code>email_logs</code> table in Supabase to track ad approval
            and payment emails.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Email Logs</p>
        <h1>Outbound email history</h1>
        <p className="adminMuted">
          Payment, approval, rejection, pause, and renewal emails sent from the
          platform.
        </p>
      </section>

      <section className="adminPanel">
        {logs.length === 0 ? (
          <PremiumEmptyState title="No emails logged yet" description="" />
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>Subject</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={String(log.id)}>
                  <td>
                    <strong>{String(log.subject || "—")}</strong>
                    <br />
                    <span className="adminMuted">
                      {String(log.email_type || "general")}
                    </span>
                    {log.error_message ? (
                      <>
                        <br />
                        <span className="adminMuted" style={{ color: "#b33a2b" }}>
                          {String(log.error_message)}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td>{String(log.email_to || "—")}</td>
                  <td>
                    <span className="adminBadge">{String(log.status || "—")}</span>
                  </td>
                  <td>
                    {log.created_at
                      ? new Date(String(log.created_at)).toLocaleString()
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
