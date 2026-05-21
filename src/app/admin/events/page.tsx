"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  approveEventOrganizer,
  detectColumns,
  runAdminMutation,
} from "@/lib/admin";
import { supabase } from "@/lib/supabase";

const EVENT_COLUMNS = [
  "is_featured",
  "verified_organizer",
  "accepting_vendors",
] as const;

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<Record<string, boolean>>({
    is_featured: true,
    verified_organizer: true,
    accepting_vendors: true,
  });
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setEvents([]);
    } else {
      const rows = (data || []) as Record<string, unknown>[];
      setEvents(rows);
      if (rows.length > 0) {
        setColumns(detectColumns(rows, [...EVENT_COLUMNS]));
      }
    }
    setLoading(false);
  }

  function patchEvent(id: string, updates: Record<string, unknown>) {
    setEvents((prev) =>
      prev.map((row) =>
        String(row.id) === id ? { ...row, ...updates } : row
      )
    );
  }

  async function mutateEvent(
    id: string,
    updates: Record<string, unknown>,
    actionLabel: string,
    column?: keyof typeof columns
  ) {
    setActingId(id);
    await runAdminMutation({
      actionLabel,
      table: "events",
      column: column as string | undefined,
      hasColumn: column ? columns[column] : true,
      run: async () => supabase.from("events").update(updates).eq("id", id),
      onSuccess: async () => {
        patchEvent(id, updates);
        await loadEvents();
      },
    });
    setActingId(null);
  }

  async function toggleEventVerified(id: string, currentlyVerified: boolean) {
    setActingId(id);

    if (!currentlyVerified) {
      await approveEventOrganizer(
        supabase,
        id,
        columns.verified_organizer,
        async () => {
          patchEvent(id, { verified_organizer: true });
          await loadEvents();
        }
      );
      setActingId(null);
      return;
    }

    await runAdminMutation({
      actionLabel: "Unverify event organizer",
      table: "events",
      column: "verified_organizer",
      hasColumn: columns.verified_organizer,
      run: async () =>
        supabase
          .from("events")
          .update({ verified_organizer: false })
          .eq("id", id),
      onSuccess: async () => {
        patchEvent(id, { verified_organizer: false });
        await loadEvents();
      },
    });

    setActingId(null);
  }

  async function deleteEvent(id: string, title: string) {
    if (!confirm(`Delete "${title}" and related applications?`)) return;

    const relatedTables = [
      "event_attendance",
      "saved_events",
      "reviews",
    ] as const;

    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq("event_id", id);
      if (error) {
        alert(`${table}: ${error.message}`);
        return;
      }
    }

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) alert(error.message);
    else await loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter((event) => {
      if (!q) return true;
      return (
        String(event.title || "")
          .toLowerCase()
          .includes(q) ||
        String(event.city || "")
          .toLowerCase()
          .includes(q) ||
        String(event.state || "")
          .toLowerCase()
          .includes(q) ||
        String(event.id).toLowerCase().includes(q) ||
        String(event.created_by || "").toLowerCase().includes(q)
      );
    });
  }, [events, search]);

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Events</p>
        <h1>Event listings</h1>
        <p className="adminMuted">
          Feature, verify organizer badge, toggle vendor applications, edit, or
          remove events. Updates write directly to Supabase.
        </p>
        {!columns.is_featured && (
          <p className="adminMuted">
            Missing <code>events.is_featured</code> — Feature button disabled.
          </p>
        )}
        {!columns.verified_organizer && (
          <p className="adminMuted">
            Missing <code>events.verified_organizer</code> — Verify button disabled.
          </p>
        )}
        {!columns.accepting_vendors && (
          <p className="adminMuted">
            Missing <code>events.accepting_vendors</code> — Open/Close disabled.
          </p>
        )}
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search title, city, state, organizer id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="adminBtn adminBtnSecondary" onClick={loadEvents}>
          Refresh
        </button>
      </div>

      <section className="adminPanel">
        {loading ? (
          <p className="adminMuted">Loading events...</p>
        ) : filtered.length === 0 ? (
          <PremiumEmptyState
            title="No events found"
            description="Adjust your search or wait for organizers to publish listings."
            actionLabel="Refresh"
            onAction={loadEvents}
          />
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => {
                const id = String(event.id);
                const isOpen = event.accepting_vendors !== false;

                return (
                  <tr key={id}>
                    <td>
                      <strong>{String(event.title || "Untitled")}</strong>
                      <br />
                      <span className="adminMuted">{String(event.category || "—")}</span>
                    </td>
                    <td>
                      {String(event.city || "")}, {String(event.state || "")}
                      <br />
                      <span className="adminMuted">
                        {formatEventDate(String(event.event_date || ""))}
                      </span>
                    </td>
                    <td>
                      <div className="adminBadgeRow">
                        {Boolean(event.is_featured) && (
                          <span className="adminBadge">Featured</span>
                        )}
                        {Boolean(event.verified_organizer) && (
                          <span className="adminBadge">Verified</span>
                        )}
                        {isOpen ? (
                          <span className="adminBadge">Open</span>
                        ) : (
                          <span className="adminBadge">Closed</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="adminActions">
                        <Link
                          href={`/events/${id}`}
                          className="adminBtn adminBtnSecondary"
                          target="_blank"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/organizer/events/${id}/edit`}
                          className="adminBtn adminBtnSecondary"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="adminBtn adminBtnGold"
                          disabled={!columns.is_featured || actingId === id}
                          title={
                            columns.is_featured
                              ? "Toggle featured"
                              : "Add events.is_featured column"
                          }
                          onClick={() =>
                            mutateEvent(
                              id,
                              { is_featured: !Boolean(event.is_featured) },
                              event.is_featured ? "Unfeature event" : "Feature event",
                              "is_featured"
                            )
                          }
                        >
                          {event.is_featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={!columns.verified_organizer || actingId === id}
                          title={
                            columns.verified_organizer
                              ? "Sets events.verified_organizer = true"
                              : "Add events.verified_organizer column"
                          }
                          onClick={() =>
                            toggleEventVerified(id, Boolean(event.verified_organizer))
                          }
                        >
                          {actingId === id
                            ? "…"
                            : event.verified_organizer
                            ? "Unverify"
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={!columns.accepting_vendors || actingId === id}
                          title={
                            columns.accepting_vendors
                              ? "Toggle vendor applications"
                              : "Add events.accepting_vendors column"
                          }
                          onClick={() =>
                            mutateEvent(
                              id,
                              { accepting_vendors: !isOpen },
                              isOpen ? "Close vendors" : "Open vendors",
                              "accepting_vendors"
                            )
                          }
                        >
                          {isOpen ? "Close" : "Open"}
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnDanger"
                          onClick={() =>
                            deleteEvent(id, String(event.title || "Event"))
                          }
                        >
                          Delete
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

function formatEventDate(date: string) {
  if (!date) return "Date TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
