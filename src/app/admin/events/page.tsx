"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setEvents(data || []);

    setLoading(false);
  }

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    if (!ADMIN_EMAILS.includes(data.user.email || "")) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setAllowed(true);
    await loadEvents();
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
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEvents();
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) return <main style={styles.page}>Loading events...</main>;
  if (!allowed) return <main style={styles.page}>Access denied.</main>;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>
        <h1 style={styles.title}>Events Management</h1>
        <p style={styles.text}>
          Review event listings, feature premium opportunities, verify
          organizers, pause visibility, or remove spam/bad event listings.
        </p>
      </section>

      <section style={styles.grid}>
        {events.length === 0 ? (
          <div style={styles.card}>No events found.</div>
        ) : (
          events.map((event) => (
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
              </div>

              <div style={styles.actions}>
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