"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ManageEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManageData() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: myEvents } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", userData.user.id)
        .order("created_at", { ascending: false });

      setEvents(myEvents || []);

      const eventIds = (myEvents || []).map((event) => event.id);

      if (eventIds.length > 0) {
        const { data: attendance } = await supabase
          .from("event_applications_with_vendors")
          .select("*")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });

        setApplications(attendance || []);
      }

      setLoading(false);
    }

    loadManageData();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("event_attendance")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Application marked as ${status}.`);
    window.location.reload();
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Organizer Dashboard</p>
          <h1>Manage Your Events</h1>
          <p className="muted">
            Review vendor applications, approve attendance, and manage your
            event listings.
          </p>
        </div>
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Your Event Listings</p>
            <h2>Submitted Events</h2>
          </div>

          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/create-event")}
          >
            Create New Event
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading organizer dashboard...</p>
        ) : events.length === 0 ? (
          <div className="emptyStateCard">
            <h3>No events created yet.</h3>
            <p>Create your first festival, fair, market, or vendor event.</p>
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/create-event")}
            >
              List Your First Event
            </button>
          </div>
        ) : (
          <div className="eventsList">
            {events.map((event) => (
              <article className="marketEventCard" key={event.id}>
                <div
                  className="marketEventImage"
                  style={{
                    backgroundImage: `url(${
                      event.image_url ||
                      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <span>{event.category || "Vendor Event"}</span>
                </div>

                <div className="marketEventBody">
                  <div className="eventDate">
                    {event.event_date || "Date coming soon"}
                  </div>

                  <h3>{event.title}</h3>

                  <p className="muted">
                    {event.city}, {event.state} {event.zip_code}
                  </p>

                  <div className="marketStats">
                    <span>${event.booth_price || "TBD"} booth</span>
                    <span>{event.expected_visitors || "TBD"} visitors</span>
                    <span>Organizer listing</span>
                  </div>

                  <div className="eventActions">
                    <button
                      className="fullBtn"
                      onClick={() =>
                        (window.location.href = `/events/${event.id}`)
                      }
                    >
                      View Event
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Vendor Applications</p>
            <h2>Approve Vendor Attendance</h2>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="emptyStateCard">
            <h3>No vendor applications yet.</h3>
            <p>
              When vendors apply to your events, their requests will appear
              here.
            </p>
          </div>
        ) : (
          <div className="applicationGrid">
            {applications.map((app) => (
              <div className="applicationCard" key={app.id}>
                <div className="applicationVendorTop">
                  <img
                    src={
                      app.logo_url ||
                      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={app.business_name || "Vendor"}
                    className="reviewVendorLogo"
                  />

                  <div>
                    <p className="goldEyebrow">Vendor Request</p>
                    <h3>{app.business_name || "Vendor Business"}</h3>

                    <div className="reviewBadges">
                      <span>{app.category || "Vendor"}</span>
                      <span>{app.verified ? "Verified" : "Pending"}</span>
                      <span>Status: {app.status}</span>
                    </div>
                  </div>
                </div>

                {app.slug && (
                  <button
                    className="outlineBtn fullWidth"
                    onClick={() => (window.location.href = `/vendors/${app.slug}`)}
                  >
                    View Vendor Profile
                  </button>
                )}

                <div className="applicationActions">
                  <button
                    className="goldBtn"
                    onClick={() => updateStatus(app.id, "approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="outlineBtn"
                    onClick={() => updateStatus(app.id, "attended")}
                  >
                    Mark Attended
                  </button>

                  <button
                    className="outlineBtn"
                    onClick={() => updateStatus(app.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}