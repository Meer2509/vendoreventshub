"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setEvents(data || []);

    setLoading(false);
  }

  async function updateEvent(id: string, updates: any) {
    const { error } = await supabase.from("events").update(updates).eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEvents();
  }

  async function deleteEvent(id: string) {
    const confirmed = confirm("Delete this event and related applications?");
    if (!confirmed) return;

    await supabase.from("event_attendance").delete().eq("event_id", id);
    await supabase.from("saved_events").delete().eq("event_id", id);
    await supabase.from("reviews").delete().eq("event_id", id);

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filtered = events.filter((event) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      event.title?.toLowerCase().includes(q) ||
      event.city?.toLowerCase().includes(q) ||
      event.state?.toLowerCase().includes(q) ||
      event.id?.toLowerCase().includes(q) ||
      event.created_by?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <main className="adminPage">
        <p className="adminMuted">Loading events...</p>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Events</p>
        <h1>All marketplace events</h1>
        <p className="adminMuted">
          Feature listings, toggle accepting vendors, verify organizers, edit, or
          delete any event safely.
        </p>
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search title, city, state, organizer id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.card}>No events found.</div>
        ) : (
          filtered.map((event) => (
            <article key={event.id} style={styles.card}>
              {event.image_url && (
                <img src={event.image_url} alt={event.title} style={styles.image} />
              )}

              <div style={styles.topRow}>
                {event.is_featured && <span style={styles.badge}>Featured</span>}
                {event.verified_organizer && (
                  <span style={styles.badge}>Verified Organizer</span>
                )}
                {event.accepting_vendors !== false && (
                  <span style={styles.badge}>Vendors Wanted</span>
                )}
              </div>

              <h2 style={styles.cardTitle}>{event.title || "Untitled Event"}</h2>

              <p style={styles.muted}>
                {event.city}, {event.state} {event.zip_code}
              </p>

              <div style={styles.infoBox}>
                <p><strong>Date:</strong> {event.event_date || "N/A"}</p>
                <p><strong>Category:</strong> {event.category || "N/A"}</p>
                <p><strong>Booth Price:</strong> ${event.booth_price || "TBD"}</p>
                <p><strong>Expected Visitors:</strong> {event.expected_visitors || "TBD"}</p>
                <p><strong>Rating:</strong> {event.rating || "New"}</p>
                <p><strong>Organizer ID:</strong> {event.created_by || "N/A"}</p>
              </div>

              <div style={styles.actions}>
                <a href={`/events/${event.id}`} style={styles.approve}>
                  Open detail
                </a>
                <a
                  href={`/dashboard/organizer/events/${event.id}/edit`}
                  style={styles.pause}
                >
                  Edit
                </a>
                <button
                  style={styles.approve}
                  onClick={() =>
                    updateEvent(event.id, { is_featured: !event.is_featured })
                  }
                >
                  {event.is_featured ? "Unfeature" : "Feature"}
                </button>

                <button
                  style={styles.pause}
                  onClick={() =>
                    updateEvent(event.id, {
                      verified_organizer: !event.verified_organizer,
                    })
                  }
                >
                  {event.verified_organizer ? "Unverify" : "Verify"}
                </button>

                <button
                  style={styles.pause}
                  onClick={() =>
                    updateEvent(event.id, {
                      accepting_vendors: event.accepting_vendors === false,
                    })
                  }
                >
                  {event.accepting_vendors === false
                    ? "Accept Vendors"
                    : "Stop Vendors"}
                </button>

                <button style={styles.reject} onClick={() => deleteEvent(event.id)}>
                  Delete
                </button>
              </div>
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
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
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
  grid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 20px 55px rgba(20, 88, 63, .10)",
  },
  image: {
    width: "100%",
    height: 190,
    objectFit: "cover",
    borderRadius: 20,
    marginBottom: 16,
  },
  topRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
  },
  muted: {
    color: "#5f6b66",
  },
  infoBox: {
    background: "#f7f3ea",
    borderRadius: 20,
    padding: 16,
    lineHeight: 1.6,
    marginTop: 14,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginTop: 18,
  },
  approve: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#14583f",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  pause: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#e8ddc7",
    color: "#10291f",
    fontWeight: 900,
    cursor: "pointer",
  },
  reject: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#8b1e1e",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};