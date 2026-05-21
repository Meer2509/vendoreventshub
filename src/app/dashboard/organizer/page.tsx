"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatDate(date: string) {
  if (!date) return "Date coming soon";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrganizerDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    const userId = userData.user.id;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);

    const { data: organizerProfileData } = await supabase
      .from("organizer_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setOrganizerProfile(organizerProfileData);

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    setMyEvents(eventsData || []);

    const eventIds = (eventsData || []).map((event) => event.id);

    if (eventIds.length > 0) {
      const { data: appData, error: appError } = await supabase
        .from("event_applications_with_vendors")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (!appError && appData) {
        setApplications(appData);
      } else {
        const { data: attendanceData } = await supabase
          .from("event_attendance")
          .select("id, status, created_at, vendor_id, events(*)")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });

        const vendorIds = [
          ...new Set(
            (attendanceData || [])
              .map((row) => row.vendor_id)
              .filter(Boolean)
          ),
        ];

        let vendorMap: Record<string, any> = {};

        if (vendorIds.length > 0) {
          const { data: vendors } = await supabase
            .from("vendor_profiles")
            .select("user_id, business_name, slug, category")
            .in("user_id", vendorIds);

          vendorMap = Object.fromEntries(
            (vendors || []).map((vendor) => [vendor.user_id, vendor])
          );
        }

        setApplications(
          (attendanceData || []).map((row) => {
            const vendor = vendorMap[row.vendor_id] || {};
            const event = Array.isArray(row.events) ? row.events[0] : row.events;

            return {
              ...row,
              business_name: vendor.business_name,
              slug: vendor.slug,
              category: vendor.category,
              event_title: event?.title,
              event_city: event?.city,
              event_state: event?.state,
              event_date: event?.event_date,
            };
          })
        );
      }
    } else {
      setApplications([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingCount = applications.filter(
    (app) => app.status === "requested"
  ).length;

  const approvedCount = applications.filter(
    (app) => app.status === "approved"
  ).length;

  const estimatedRevenue = useMemo(() => {
    return myEvents.reduce((total, event) => {
      const booth = Number(event.booth_price || 0);
      return total + booth * approvedCount;
    }, 0);
  }, [myEvents, approvedCount]);

  async function updateApplicationStatus(applicationId: string, status: string) {
    const { error } = await supabase
      .from("event_attendance")
      .update({ status })
      .eq("id", applicationId);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Application marked as ${status}.`);
    loadDashboard();
  }

  async function deleteEvent(eventId: string, eventTitle: string) {
    const confirmed = confirm(
      `Delete "${eventTitle}"?\n\nThis will remove the event and all vendor applications connected to it. This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingEventId(eventId);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login again.");
      window.location.href = "/login";
      return;
    }

    const { data: eventCheck, error: checkError } = await supabase
      .from("events")
      .select("id, created_by")
      .eq("id", eventId)
      .eq("created_by", userData.user.id)
      .single();

    if (checkError || !eventCheck) {
      alert("You can only delete events you created.");
      setDeletingEventId(null);
      return;
    }

    const { error: attendanceError } = await supabase
      .from("event_attendance")
      .delete()
      .eq("event_id", eventId);

    if (attendanceError) {
      alert(attendanceError.message);
      setDeletingEventId(null);
      return;
    }

    const { error: savedError } = await supabase
      .from("saved_events")
      .delete()
      .eq("event_id", eventId);

    if (savedError) {
      alert(savedError.message);
      setDeletingEventId(null);
      return;
    }

    const { error: reviewError } = await supabase
      .from("reviews")
      .delete()
      .eq("event_id", eventId);

    if (reviewError) {
      alert(reviewError.message);
      setDeletingEventId(null);
      return;
    }

    const { error: eventError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("created_by", userData.user.id);

    if (eventError) {
      alert(eventError.message);
      setDeletingEventId(null);
      return;
    }

    alert("Event deleted successfully.");
    setDeletingEventId(null);
    loadDashboard();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="dashboardPage">
      <section className="hero">
        <div>
          <p className="eyebrow">Organizer Dashboard</p>

          <h1>
            Welcome back
            {profile?.business_name ? `, ${profile.business_name}` : ""}
          </h1>

          <p className="heroText">
            Manage your events, review vendor applications, track approvals,
            and grow your event visibility from one organizer command center.
          </p>

          <div className="heroButtons">
            <button onClick={() => (window.location.href = "/create-event")}>
              Create Event
            </button>

            <button
              className="secondary"
              onClick={() =>
                (window.location.href = "/dashboard/organizer/setup")
              }
            >
              Edit Organizer Profile
            </button>

            {organizerProfile?.slug && (
              <button
                className="secondary"
                onClick={() =>
                  (window.location.href = `/organizers/${organizerProfile.slug}`)
                }
              >
                View Public Profile
              </button>
            )}

            <button
              className="secondary"
              onClick={() => (window.location.href = "/advertise")}
            >
              Boost Event
            </button>

            <button className="secondary" onClick={logout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="scoreCard">
          <p className="eyebrow">Organizer Growth</p>

          <div className="scoreCircle">{myEvents.length}</div>

          <h3>Events Managed</h3>

          <p>
            Create trusted event listings, attract better vendors, and manage
            applications professionally.
          </p>
        </div>
      </section>

      <section className="metrics">
        <div className="metricCard">
          <strong>{myEvents.length}</strong>
          <span>My Events</span>
        </div>

        <div className="metricCard">
          <strong>{pendingCount}</strong>
          <span>Pending Applicants</span>
        </div>

        <div className="metricCard">
          <strong>{approvedCount}</strong>
          <span>Approved Vendors</span>
        </div>

        <div className="metricCard premium">
          <strong>${estimatedRevenue}</strong>
          <span>Estimated Booth Revenue</span>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">My Events</p>
            <h2>Your event portfolio.</h2>
          </div>

          <button onClick={() => (window.location.href = "/create-event")}>
            Create New Event
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading organizer events...</p>
        ) : myEvents.length === 0 ? (
          <div className="emptyState">
            <h3>No events yet</h3>
            <p>
              Create your first festival, fair, market, expo, or pop-up listing
              to start receiving vendor applications.
            </p>

            <button onClick={() => (window.location.href = "/create-event")}>
              Create Event
            </button>
          </div>
        ) : (
          <div className="cardGrid">
            {myEvents.map((event) => (
              <article className="eventCard" key={event.id}>
                <div
                  className="eventImage"
                  style={{
                    backgroundImage: `url(${
                      event.image_url ||
                      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <span>{event.is_featured ? "Featured" : "Listed"}</span>
                </div>

                <div className="eventBody">
                  <p className="status">{formatDate(event.event_date)}</p>

                  <h3>{event.title}</h3>

                  <p className="muted">
                    {event.city}, {event.state} {event.zip_code}
                  </p>

                  <div className="pillGrid">
                    <span>${event.booth_price || "TBD"} Booth</span>
                    <span>{event.expected_visitors || "TBD"} Visitors</span>
                    <span>
                      {event.accepting_vendors === false
                        ? "Closed"
                        : "Accepting Vendors"}
                    </span>
                  </div>

                  <div className="buttonRow">
                    <button
                      onClick={() =>
                        (window.location.href = `/events/${event.id}`)
                      }
                    >
                      View Event
                    </button>

                    <button
                      className="secondary"
                      onClick={() => (window.location.href = "/advertise")}
                    >
                      Boost
                    </button>

                    <button
                      className="danger"
                      disabled={deletingEventId === event.id}
                      onClick={() => deleteEvent(event.id, event.title)}
                    >
                      {deletingEventId === event.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Vendor Applications</p>
            <h2>Approve, waitlist, or reject vendors.</h2>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="emptyState">
            <h3>No vendor applications yet</h3>
            <p>
              When vendors apply to your events, they will appear here for
              review.
            </p>
          </div>
        ) : (
          <div className="applicationGrid">
            {applications.map((application) => {
              return (
                <article className="applicationCard" key={application.id}>
                  <p className="status">{application.status}</p>

                  <h3>
                    {application.business_name ||
                      application.event_title ||
                      "Vendor Application"}
                  </h3>

                  <p className="muted">
                    {application.event_title
                      ? `Event: ${application.event_title}`
                      : "Event application"}{" "}
                    · Applied{" "}
                    {application.created_at
                      ? new Date(application.created_at).toLocaleDateString()
                      : "recently"}
                  </p>

                  <div className="pillGrid">
                    <span>{application.category || "Vendor"}</span>
                    <span>
                      {application.event_city}, {application.event_state}
                    </span>
                    <span>{formatDate(application.event_date)}</span>
                  </div>

                  {application.slug && (
                    <button
                      className="secondary"
                      style={{ marginBottom: 12 }}
                      onClick={() =>
                        (window.location.href = `/vendors/${application.slug}`)
                      }
                    >
                      View Vendor Profile
                    </button>
                  )}

                  <div className="buttonRow">
                    <button
                      onClick={() =>
                        updateApplicationStatus(application.id, "approved")
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="secondary"
                      onClick={() =>
                        updateApplicationStatus(application.id, "waitlist")
                      }
                    >
                      Waitlist
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        updateApplicationStatus(application.id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="growthPanel">
          <p className="eyebrow">Organizer Growth Tools</p>

          <h2>Make your event more attractive to vendors.</h2>

          <p>
            Add strong event photos, clear booth pricing, expected visitor
            numbers, social media links, vendor rules, and application details
            to build trust faster.
          </p>

          <div className="heroButtons center">
            <button onClick={() => (window.location.href = "/create-event")}>
              Improve Event Listings
            </button>

            <button
              className="secondary"
              onClick={() => (window.location.href = "/advertise")}
            >
              Promote Event
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .dashboardPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          min-height: 100vh;
          color: #10291f;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 70px 18px;
        }

        .hero {
          min-height: 72vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 30px;
          align-items: center;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        h1 {
          font-size: clamp(44px, 8vw, 82px);
          line-height: 0.9;
          letter-spacing: -0.07em;
          margin: 0;
        }

        h2 {
          font-size: clamp(34px, 5vw, 58px);
          line-height: 0.94;
          letter-spacing: -0.06em;
          margin: 0;
        }

        h3 {
          font-size: 25px;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .heroText,
        .muted,
        .scoreCard p,
        .growthPanel p,
        .emptyState p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 760px;
          margin-top: 24px;
        }

        .heroButtons,
        .buttonRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .center {
          justify-content: center;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 14px 22px;
          font-weight: 950;
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.2);
        }

        button.secondary {
          background: rgba(255, 255, 255, 0.72);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        button.danger {
          background: #8f2d20;
        }

        .scoreCard,
        .metricCard,
        .eventCard,
        .applicationCard,
        .emptyState,
        .growthPanel {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .scoreCard {
          padding: 36px;
          text-align: center;
        }

        .scoreCircle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f7f1e6;
          border: 12px solid #b88a2e;
          font-size: 48px;
          font-weight: 1000;
          margin: 28px auto;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          padding-top: 20px;
        }

        .metricCard {
          padding: 28px;
        }

        .metricCard strong {
          display: block;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.06em;
        }

        .metricCard span {
          color: #5f6b66;
          display: block;
          margin-top: 8px;
          font-weight: 850;
        }

        .metricCard.premium {
          background: linear-gradient(145deg, #10291f, #1f4f3c);
          color: white;
        }

        .metricCard.premium span {
          color: rgba(255, 255, 255, 0.76);
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .cardGrid,
        .applicationGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .applicationGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        .eventCard {
          overflow: hidden;
        }

        .eventImage {
          min-height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .eventImage span {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
        }

        .eventBody,
        .applicationCard,
        .emptyState,
        .growthPanel {
          padding: 30px;
        }

        .status {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 10px;
        }

        .pillGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 18px 0;
        }

        .pillGrid span {
          background: #f7f1e6;
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .buttonRow button {
          flex: 1;
        }

        .emptyState,
        .growthPanel {
          text-align: center;
        }

        .growthPanel {
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 980px) {
          .hero,
          .metrics,
          .cardGrid,
          .applicationGrid {
            grid-template-columns: 1fr;
          }

          section {
            padding: 52px 16px;
          }

          .hero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 52px;
          }

          .heroButtons button,
          .buttonRow button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}