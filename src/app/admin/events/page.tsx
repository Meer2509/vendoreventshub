"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { supabase } from "@/lib/supabase";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setEvents(data || []);
    setLoading(false);
  }

  async function updateEvent(id: string, updates: Record<string, unknown>) {
    const { error } = await supabase.from("events").update(updates).eq("id", id);
    if (error) alert(error.message);
    else await loadEvents();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event and related applications?")) return;

    await supabase.from("event_attendance").delete().eq("event_id", id);
    await supabase.from("saved_events").delete().eq("event_id", id);
    await supabase.from("reviews").delete().eq("event_id", id);

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
        event.title?.toLowerCase().includes(q) ||
        event.city?.toLowerCase().includes(q) ||
        event.state?.toLowerCase().includes(q) ||
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
          Feature, verify, toggle vendor applications, edit, or remove events.
        </p>
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
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.title || "Untitled"}</strong>
                    <br />
                    <span className="adminMuted">{event.category || "—"}</span>
                  </td>
                  <td>
                    {event.city}, {event.state}
                    <br />
                    <span className="adminMuted">{formatEventDate(event.event_date)}</span>
                  </td>
                  <td>
                    <div className="adminBadgeRow">
                      {event.is_featured && <span className="adminBadge">Featured</span>}
                      {event.verified_organizer && (
                        <span className="adminBadge">Verified</span>
                      )}
                      {event.accepting_vendors !== false ? (
                        <span className="adminBadge">Open</span>
                      ) : (
                        <span className="adminBadge">Closed</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="adminActions">
                      <Link
                        href={`/events/${event.id}`}
                        className="adminBtn adminBtnSecondary"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/organizer/events/${event.id}/edit`}
                        className="adminBtn adminBtnSecondary"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="adminBtn adminBtnGold"
                        onClick={() =>
                          updateEvent(event.id, { is_featured: !event.is_featured })
                        }
                      >
                        {event.is_featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        type="button"
                        className="adminBtn adminBtnSecondary"
                        onClick={() =>
                          updateEvent(event.id, {
                            verified_organizer: !event.verified_organizer,
                          })
                        }
                      >
                        {event.verified_organizer ? "Unverify" : "Verify"}
                      </button>
                      <button
                        type="button"
                        className="adminBtn adminBtnSecondary"
                        onClick={() =>
                          updateEvent(event.id, {
                            accepting_vendors: event.accepting_vendors === false,
                          })
                        }
                      >
                        {event.accepting_vendors === false ? "Open" : "Close"}
                      </button>
                      <button
                        type="button"
                        className="adminBtn adminBtnDanger"
                        onClick={() => deleteEvent(event.id)}
                      >
                        Delete
                      </button>
                    </div>
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
