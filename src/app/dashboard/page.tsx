"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      setEmail(userData.user.email ?? null);

      const { data, error } = await supabase
        .from("saved_events")
        .select("id, created_at, events(*)")
        .eq("vendor_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setSavedEvents(data || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Vendor Dashboard</p>
          <h1>Welcome back.</h1>
          <p className="muted">
            Manage your saved events, vendor profile, reviews, uploads, and
            premium visibility.
          </p>
          <p className="dashboardEmail">{email}</p>
        </div>

        <button onClick={logout} className="outlineBtn">
          Log Out
        </button>
      </section>

      <section className="dashboardGrid">
        <div className="dashboardCard">
          <h3>Saved Events</h3>
          <p>Track festivals, fairs, and markets you want to attend.</p>
          <strong>{savedEvents.length} saved</strong>
        </div>

        <div className="dashboardCard">
          <h3>My Reviews</h3>
          <p>Rate only the events you actually attended.</p>
          <strong>0 reviews</strong>
        </div>

        <div className="dashboardCard">
          <h3>Vendor Profile</h3>
          <p>Update your business profile, logo, banner, and links.</p>
          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/profile/setup")}
          >
            Edit Profile
          </button>
        </div>

        <div className="dashboardCard premiumCard">
          <h3>Sponsored Visibility</h3>
          <p>Promote your brand on city pages, event pages, and homepage ads.</p>
          <button className="goldBtn">Explore Ads</button>
        </div>
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Saved Opportunities</p>
            <h2>Your Saved Events</h2>
          </div>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/events")}
          >
            Browse More Events
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading saved events...</p>
        ) : savedEvents.length === 0 ? (
          <div className="emptyStateCard">
            <h3>No saved events yet.</h3>
            <p>
              Browse the marketplace and save festivals, fairs, and markets you
              want to attend.
            </p>
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/events")}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="eventsList">
            {savedEvents.map((saved) => {
              const event = saved.events;

              return (
                <article className="marketEventCard" key={saved.id}>
                  <div
                    className="marketEventImage"
                    style={{
                      backgroundImage: `url(${
                        event?.image_url ||
                        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                      })`,
                    }}
                  >
                    <span>{event?.category || "Vendor Event"}</span>
                  </div>

                  <div className="marketEventBody">
                    <div className="eventDate">
                      {event?.event_date || "Date coming soon"}
                    </div>

                    <h3>{event?.title}</h3>

                    <p className="muted">
                      {event?.city}, {event?.state} {event?.zip_code}
                    </p>

                    <div className="marketStats">
                      <span>★ {event?.rating || "New"}</span>
                      <span>${event?.booth_price || "TBD"} booth</span>
                      <span>{event?.expected_visitors || "TBD"} visitors</span>
                      <span>Saved event</span>
                    </div>

                    <div className="eventActions">
                      <button
                        className="fullBtn"
                        onClick={() =>
                          (window.location.href = `/events/${event?.id}`)
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}