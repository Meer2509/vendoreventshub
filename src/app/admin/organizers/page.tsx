"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { approveOrganizer, runAdminMutation } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type OrganizerRow = {
  user_id: string;
  organizer_name?: string | null;
  slug?: string | null;
  short_description?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<OrganizerRow[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hasVerifiedColumn, setHasVerifiedColumn] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    const [{ data: orgRows, error }, { data: eventRows }] = await Promise.all([
      supabase.from("organizer_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("created_by"),
    ]);

    if (error) {
      alert(error.message);
      setOrganizers([]);
    } else {
      const rows = (orgRows as OrganizerRow[]) || [];
      setOrganizers(rows);
      if (rows.length > 0) {
        setHasVerifiedColumn(
          Object.prototype.hasOwnProperty.call(rows[0], "verified")
        );
      }

      const counts: Record<string, number> = {};
      for (const event of eventRows || []) {
        if (!event.created_by) continue;
        counts[event.created_by] = (counts[event.created_by] || 0) + 1;
      }
      setEventCounts(counts);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return organizers.filter((org) => {
      if (!q) return true;
      return (
        org.organizer_name?.toLowerCase().includes(q) ||
        org.slug?.toLowerCase().includes(q) ||
        org.user_id.toLowerCase().includes(q)
      );
    });
  }, [organizers, search]);

  function patchOrganizer(userId: string, verified: boolean) {
    setOrganizers((prev) =>
      prev.map((row) =>
        row.user_id === userId ? { ...row, verified } : row
      )
    );
  }

  async function toggleVerified(userId: string, currentlyVerified: boolean) {
    setActingId(userId);

    if (!currentlyVerified) {
      await approveOrganizer(supabase, userId, hasVerifiedColumn, async () => {
        patchOrganizer(userId, true);
        await load();
      });
      setActingId(null);
      return;
    }

    await runAdminMutation({
      actionLabel: "Unverify organizer",
      table: "organizer_profiles",
      column: "verified",
      hasColumn: hasVerifiedColumn,
      run: async () =>
        supabase
          .from("organizer_profiles")
          .update({ verified: false })
          .eq("user_id", userId),
      onSuccess: async () => {
        patchOrganizer(userId, false);
        await load();
      },
    });

    setActingId(null);
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Organizers</p>
        <h1>Organizer profiles</h1>
        <p className="adminMuted">
          Review public organizer profiles, event counts, and verification status.
          {!hasVerifiedColumn && (
            <> Add <code>organizer_profiles.verified</code> boolean for verify toggles.</>
          )}
        </p>
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search organizer name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="adminBtn adminBtnSecondary" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="adminMuted">Loading organizers...</p>
      ) : filtered.length === 0 ? (
        <PremiumEmptyState
          title="No organizer profiles yet"
          description="Organizers appear here after completing organizer setup."
          actionLabel="View Events"
          onAction={() => (window.location.href = "/admin/events")}
        />
      ) : (
        <section className="adminPanel">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Events</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.user_id}>
                  <td>
                    <strong>{org.organizer_name || "Unnamed"}</strong>
                    <br />
                    <span className="adminMuted">{org.slug || org.user_id}</span>
                  </td>
                  <td>{eventCounts[org.user_id] || 0}</td>
                  <td>
                    <div className="adminActions">
                      {hasVerifiedColumn ? (
                        <button
                          type="button"
                          className="adminBtn adminBtnGold"
                          disabled={actingId === org.user_id}
                          onClick={() =>
                            toggleVerified(org.user_id, Boolean(org.verified))
                          }
                        >
                          {actingId === org.user_id
                            ? "…"
                            : org.verified
                            ? "Verified"
                            : "Approve"}
                        </button>
                      ) : (
                        <span className="adminBadge">Verify N/A</span>
                      )}
                      {org.slug ? (
                        <Link
                          href={`/organizers/${org.slug}`}
                          className="adminBtn adminBtnSecondary"
                          target="_blank"
                        >
                          Open
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled
                          title="No public slug"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
