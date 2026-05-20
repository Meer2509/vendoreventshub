"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = "vendor" | "organizer" | "admin";

const tabs = [
  "Overview",
  "Saved",
  "Applications",
  "Organizer",
  "Vendor Applications",
  "Growth",
  "Settings",
];

function getVendorScore(event: any) {
  const booth = Number(event?.booth_price || 0);
  const visitors = Number(
    String(event?.expected_visitors || "").replace(/\D/g, "") || 0
  );
  const rating = Number(event?.rating || 0);
  const featured = Boolean(event?.is_featured);
  const verified = Boolean(event?.verified_organizer);
  const accepting = event?.accepting_vendors !== false;

  let score = 55;

  if (visitors >= 10000) score += 20;
  else if (visitors >= 5000) score += 15;
  else if (visitors >= 1000) score += 10;
  else if (visitors > 0) score += 5;

  if (booth > 0 && booth <= 100) score += 15;
  else if (booth <= 250) score += 10;
  else if (booth <= 500) score += 5;

  if (rating >= 4.8) score += 10;
  else if (rating >= 4.3) score += 7;
  else if (rating >= 3.8) score += 4;

  if (featured) score += 5;
  if (verified) score += 4;
  if (accepting) score += 2;

  return Math.min(score, 99);
}

function getBoothValue(event: any) {
  const booth = Number(event?.booth_price || 0);
  if (!booth) return "Booth TBD";
  if (booth <= 100) return "Excellent Value";
  if (booth <= 250) return "Strong Value";
  if (booth <= 500) return "Moderate Value";
  return "Premium Fee";
}

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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("vendor");

  const [profile, setProfile] = useState<any>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [organizerApplications, setOrganizerApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(userData.user.id);
    setEmail(userData.user.email ?? null);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setRole(profileData.role || "vendor");
    }

    const { data: savedData } = await supabase
      .from("saved_events")
      .select("id, created_at, events(*)")
      .eq("vendor_id", userData.user.id)
      .order("created_at", { ascending: false });

    setSavedEvents(savedData || []);

    const { data: attendanceData } = await supabase
      .from("event_attendance")
      .select("id, status, created_at, events(*)")
      .eq("vendor_id", userData.user.id)
      .order("created_at", { ascending: false });

    setApplications(attendanceData || []);

    const { data: organizerEvents } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userData.user.id)
      .order("created_at", { ascending: false });

    setMyEvents(organizerEvents || []);

    const eventIds = (organizerEvents || []).map((event) => event.id);

    if (eventIds.length > 0) {
      const { data: organizerApplicationData } = await supabase
        .from("event_attendance")
        .select("id, status, created_at, vendor_id, events(*)")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      setOrganizerApplications(organizerApplicationData || []);
    } else {
      setOrganizerApplications([]);
    }

    const { data: recEvents } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    setRecommendedEvents(recEvents || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const profileScore = useMemo(() => {
    let score = 20;
    if (profile?.business_name) score += 20;
    if (profile?.logo_url) score += 20;
    if (profile?.banner_url) score += 15;
    if (profile?.description) score += 15;
    if (profile?.website_url) score += 10;
    return Math.min(score, 100);
  }, [profile]);

  const approvedCount = organizerApplications.filter(
    (item) => item.status === "approved"
  ).length;

  const pendingCount = organizerApplications.filter(
    (item) => item.status === "requested"
  ).length;

  const applicationApprovedCount = applications.filter(
    (item) => item.status === "approved"
  ).length;

  const estimatedOrganizerRevenue = myEvents.reduce((total, event) => {
    const booth = Number(event.booth_price || 0);
    return total + booth * approvedCount;
  }, 0);

  const strongestSavedEvent = useMemo(() => {
    const source = savedEvents
      .map((item) => item.events)
      .filter(Boolean)
      .sort((a, b) => getVendorScore(b) - getVendorScore(a));

    return source[0] || null;
  }, [savedEvents]);

  const topRecommendedEvent = useMemo(() => {
    return [...recommendedEvents].sort(
      (a, b) => getVendorScore(b) - getVendorScore(a)
    )[0];
  }, [recommendedEvents]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function removeSavedEvent(savedId: string) {
    const confirmDelete = confirm("Remove this event from your saved list?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("saved_events")
      .delete()
      .eq("id", savedId);

    if (error) {
      alert(error.message);
      return;
    }

    setSavedEvents((current) => current.filter((item) => item.id !== savedId));
    alert("Event removed.");
  }

  async function applyToEvent(eventId: string) {
    if (!userId) return;

    const { error } = await supabase.from("event_attendance").insert({
      event_id: eventId,
      vendor_id: userId,
      status: "requested",
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        alert("You already applied for this event.");
      } else {
        alert(error.message);
      }
      return;
    }

    alert("Application sent.");
    loadDashboard();
  }

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

  return (
    <main className="dashboardPage">
      <section className="hero">
        <div>
          <p className="eyebrow">VendorEventsHub Command Center</p>
          <h1>
            Welcome back
            {profile?.business_name ? `, ${profile.business_name}` : "."}
          </h1>
          <p className="heroText">
            Track saved events, vendor applications, organizer activity, profile
            strength, growth tools, and premium event intelligence in one place.
          </p>

          <div className="trustRow">
            <span>{email}</span>
            <span>{role} account</span>
            <span>{profileScore}% profile strength</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Growth Snapshot</p>

          <div className="scoreCircle">{profileScore}</div>

          <h3>Profile Strength Score</h3>
          <p>
            Stronger profiles help organizers trust your business and improve
            your marketplace presence.
          </p>

          <div className="heroActions">
            <button onClick={() => (window.location.href = "/profile/setup")}>
              Improve Profile
            </button>
            <button className="secondary" onClick={logout}>
              Log Out
            </button>
          </div>
        </div>
      </section>

      <section className="tabShell">
        <div className="tabRow">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "active" : ""}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "Overview" && (
        <>
          <section className="metricGrid">
            <div className="metricCard">
              <p>Saved Events</p>
              <strong>{savedEvents.length}</strong>
              <span>Events you are tracking</span>
            </div>

            <div className="metricCard">
              <p>Applications</p>
              <strong>{applications.length}</strong>
              <span>{applicationApprovedCount} approved</span>
            </div>

            <div className="metricCard">
              <p>Organizer Applicants</p>
              <strong>{organizerApplications.length}</strong>
              <span>{pendingCount} pending review</span>
            </div>

            <div className="metricCard premium">
              <p>Estimated Booth Revenue</p>
              <strong>${estimatedOrganizerRevenue}</strong>
              <span>Based on approved vendors</span>
            </div>
          </section>

          <section className="section">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">Smart Command Center</p>
                <h2>Your next best actions.</h2>
              </div>
            </div>

            <div className="actionGrid">
              <div>
                <span>01</span>
                <h3>Find stronger events</h3>
                <p>
                  Compare Vendor Score™, booth value, traffic, and event fit
                  before applying.
                </p>
                <button onClick={() => (window.location.href = "/events")}>
                  Explore Events
                </button>
              </div>

              <div>
                <span>02</span>
                <h3>List an event</h3>
                <p>
                  Organizers can create premium event listings and attract
                  qualified vendors.
                </p>
                <button
                  className="secondary"
                  onClick={() => (window.location.href = "/create-event")}
                >
                  Create Event
                </button>
              </div>

              <div>
                <span>03</span>
                <h3>Boost visibility</h3>
                <p>
                  Promote your event, vendor business, or service through
                  premium placements.
                </p>
                <button
                  className="secondary"
                  onClick={() => (window.location.href = "/advertise")}
                >
                  Advertise
                </button>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">Recommended Events</p>
                <h2>Smart opportunities to review next.</h2>
              </div>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/events")}
              >
                Browse All Events
              </button>
            </div>

            <div className="eventGrid">
              {recommendedEvents.slice(0, 3).map((event) => (
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
                    <span>{getVendorScore(event)}/100 Vendor Score</span>
                  </div>

                  <div className="eventBody">
                    <p>{formatDate(event.event_date)}</p>
                    <h3>{event.title}</h3>
                    <small>
                      {event.city}, {event.state} {event.zip_code}
                    </small>

                    <div className="pillGrid">
                      <span>${event.booth_price || "TBD"} Booth</span>
                      <span>{event.expected_visitors || "TBD"} Visitors</span>
                      <span>{getBoothValue(event)}</span>
                    </div>

                    <button
                      onClick={() =>
                        (window.location.href = `/events/${event.id}`)
                      }
                    >
                      View Intelligence
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="insightPanel">
              <div>
                <p className="eyebrow">Marketplace Intelligence</p>
                <h2>Best opportunity signal.</h2>
                <p>
                  {strongestSavedEvent
                    ? `${strongestSavedEvent.title} currently has the strongest score among your saved events.`
                    : topRecommendedEvent
                    ? `${topRecommendedEvent.title} is currently one of the strongest opportunities to review.`
                    : "Save events to build your personal vendor opportunity dashboard."}
                </p>
              </div>

              <button
                onClick={() =>
                  (window.location.href = strongestSavedEvent
                    ? `/events/${strongestSavedEvent.id}`
                    : "/events")
                }
              >
                Review Opportunity
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === "Saved" && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Saved Opportunities</p>
              <h2>Your vendor intelligence wallet.</h2>
            </div>

            <button
              className="secondary"
              onClick={() => (window.location.href = "/events")}
            >
              Browse More Events
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading saved events...</p>
          ) : savedEvents.length === 0 ? (
            <div className="emptyState">
              <h3>No saved events yet.</h3>
              <p>
                Save events to compare vendor score, booth value, traffic, and
                risk.
              </p>
              <button onClick={() => (window.location.href = "/events")}>
                Explore Events
              </button>
            </div>
          ) : (
            <div className="listStack">
              {savedEvents.map((saved) => {
                const event = saved.events;

                return (
                  <article className="listCard" key={saved.id}>
                    <div
                      className="listImage"
                      style={{
                        backgroundImage: `url(${
                          event?.image_url ||
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                        })`,
                      }}
                    >
                      <span>{getVendorScore(event)}/100 Vendor Score</span>
                    </div>

                    <div className="listBody">
                      <p>{formatDate(event?.event_date)}</p>
                      <h3>{event?.title}</h3>
                      <small>
                        {event?.city}, {event?.state} {event?.zip_code}
                      </small>

                      <div className="pillGrid">
                        <span>★ {event?.rating || "New"}</span>
                        <span>${event?.booth_price || "TBD"} Booth</span>
                        <span>{event?.expected_visitors || "TBD"} Visitors</span>
                        <span>{getBoothValue(event)}</span>
                      </div>

                      <div className="buttonRow">
                        <button
                          onClick={() =>
                            (window.location.href = `/events/${event?.id}`)
                          }
                        >
                          View Intelligence
                        </button>
                        <button
                          className="secondary"
                          onClick={() => applyToEvent(event?.id)}
                        >
                          Apply
                        </button>
                        <button
                          className="secondary"
                          onClick={() => removeSavedEvent(saved.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "Applications" && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Application Tracker</p>
              <h2>Your event applications.</h2>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="emptyState">
              <h3>No applications yet.</h3>
              <p>
                Apply to events and track requested, approved, and attended
                opportunities here.
              </p>
            </div>
          ) : (
            <div className="listStack">
              {applications.map((application) => {
                const event = application.events;

                return (
                  <article className="listCard" key={application.id}>
                    <div
                      className="listImage"
                      style={{
                        backgroundImage: `url(${
                          event?.image_url ||
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                        })`,
                      }}
                    >
                      <span>{application.status}</span>
                    </div>

                    <div className="listBody">
                      <p>{formatDate(event?.event_date)}</p>
                      <h3>{event?.title}</h3>
                      <small>
                        {event?.city}, {event?.state} {event?.zip_code}
                      </small>

                      <div className="pillGrid">
                        <span>Status: {application.status}</span>
                        <span>${event?.booth_price || "TBD"} Booth</span>
                        <span>{event?.expected_visitors || "TBD"} Visitors</span>
                      </div>

                      <button
                        onClick={() =>
                          (window.location.href = `/events/${event?.id}`)
                        }
                      >
                        View Event
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "Organizer" && (
        <>
          <section className="metricGrid">
            <div className="metricCard">
              <p>My Events</p>
              <strong>{myEvents.length}</strong>
              <span>Events you manage</span>
            </div>

            <div className="metricCard">
              <p>Pending Applicants</p>
              <strong>{pendingCount}</strong>
              <span>Waiting for review</span>
            </div>

            <div className="metricCard">
              <p>Approved Vendors</p>
              <strong>{approvedCount}</strong>
              <span>Accepted vendors</span>
            </div>

            <div className="metricCard premium">
              <p>Booth Revenue Estimate</p>
              <strong>${estimatedOrganizerRevenue}</strong>
              <span>Estimated revenue</span>
            </div>
          </section>

          <section className="section">
            <div className="sectionHead">
              <div>
                <p className="eyebrow">Organizer Center</p>
                <h2>Your event portfolio.</h2>
              </div>

              <button onClick={() => (window.location.href = "/create-event")}>
                Create Event
              </button>
            </div>

            {myEvents.length === 0 ? (
              <div className="emptyState">
                <h3>No organizer events yet.</h3>
                <p>
                  Create your first event to manage listings, applications, and
                  visibility.
                </p>
              </div>
            ) : (
              <div className="listStack">
                {myEvents.map((event) => (
                  <article className="listCard" key={event.id}>
                    <div
                      className="listImage"
                      style={{
                        backgroundImage: `url(${
                          event.image_url ||
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                        })`,
                      }}
                    >
                      <span>{getVendorScore(event)}/100 Event Score</span>
                    </div>

                    <div className="listBody">
                      <p>{formatDate(event.event_date)}</p>
                      <h3>{event.title}</h3>
                      <small>
                        {event.city}, {event.state} {event.zip_code}
                      </small>

                      <div className="pillGrid">
                        <span>${event.booth_price || "TBD"} Booth</span>
                        <span>{event.expected_visitors || "TBD"} Visitors</span>
                        <span>{event.is_featured ? "Featured" : "Listed"}</span>
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
                          onClick={() => setActiveTab("Vendor Applications")}
                        >
                          View Applicants
                        </button>
                        <button
                          className="secondary"
                          onClick={() => (window.location.href = "/advertise")}
                        >
                          Boost Event
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "Vendor Applications" && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Vendor Application Center</p>
              <h2>Approve, reject, or waitlist vendors.</h2>
            </div>
          </div>

          {organizerApplications.length === 0 ? (
            <div className="emptyState">
              <h3>No vendor applications yet.</h3>
              <p>
                When vendors apply to your events, they will appear here for
                approval.
              </p>
            </div>
          ) : (
            <div className="applicationGrid">
              {organizerApplications.map((application) => {
                const event = application.events;

                return (
                  <article className="applicationCard" key={application.id}>
                    <h3>{event?.title || "Event Application"}</h3>
                    <p className="muted">
                      Applied:{" "}
                      {application.created_at
                        ? new Date(application.created_at).toLocaleDateString()
                        : "Recently"}
                    </p>

                    <div className="pillGrid">
                      <span>Status: {application.status}</span>
                      <span>Vendor ID: {application.vendor_id?.slice(0, 8)}...</span>
                      <span>
                        {event?.city}, {event?.state}
                      </span>
                    </div>

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
                        className="secondary"
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
      )}

      {activeTab === "Growth" && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Premium Growth Tools</p>
              <h2>Turn visibility into applications, customers, and trust.</h2>
            </div>
          </div>

          <div className="growthGrid">
            <div>
              <span>$49+</span>
              <h3>Premium Advertising</h3>
              <p>
                Promote your event, vendor business, or service across
                high-intent pages.
              </p>
              <button onClick={() => (window.location.href = "/advertise")}>
                Start Advertising
              </button>
            </div>

            <div>
              <span>Score</span>
              <h3>Vendor Score™</h3>
              <p>
                Compare traffic, booth value, trust, and opportunity before
                applying.
              </p>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/events")}
              >
                Explore Scores
              </button>
            </div>

            <div>
              <span>Trust</span>
              <h3>Profile Strength</h3>
              <p>
                A complete vendor profile helps organizers understand your
                business faster.
              </p>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/profile/setup")}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Settings" && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Account Settings</p>
              <h2>Manage profile, account type, and trust signals.</h2>
            </div>
          </div>

          <div className="settingsCard">
            <label>
              Account Email
              <input value={email || ""} readOnly />
            </label>

            <label>
              Current Account Type
              <input value={role} readOnly />
            </label>

            <div className="buttonRow">
              <button onClick={() => (window.location.href = "/profile/setup")}>
                Edit Profile
              </button>

              <button
                className="secondary"
                onClick={() => (window.location.href = "/create-event")}
              >
                Create Event
              </button>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .dashboardPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
          min-height: 100vh;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 70px 18px;
        }

        .hero {
          min-height: 76vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
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
          font-size: clamp(48px, 8vw, 92px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
        }

        h2 {
          font-size: clamp(34px, 5vw, 62px);
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
        .sectionHead p,
        .heroPanel p,
        .actionGrid p,
        .insightPanel p,
        .eventBody small,
        .listBody small,
        .emptyState p,
        .growthGrid p,
        .muted {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 780px;
          margin-top: 24px;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }

        .trustRow span,
        .pillGrid span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .metricCard,
        .actionGrid div,
        .eventCard,
        .insightPanel,
        .listCard,
        .emptyState,
        .applicationCard,
        .growthGrid div,
        .settingsCard {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
          text-align: center;
        }

        .panelBadge {
          display: inline-block;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 18px;
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

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.2);
        }

        button.secondary {
          background: rgba(255, 255, 255, 0.7);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .heroActions,
        .buttonRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .tabShell {
          padding-top: 0;
          padding-bottom: 26px;
        }

        .tabRow {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #eadfc9;
          border-radius: 999px;
          padding: 10px;
          box-shadow: 0 18px 50px rgba(20, 88, 63, 0.08);
        }

        .tabRow button {
          white-space: nowrap;
          background: transparent;
          color: #10291f;
          box-shadow: none;
        }

        .tabRow button.active {
          background: #10291f;
          color: white;
        }

        .metricGrid,
        .eventGrid,
        .actionGrid,
        .growthGrid,
        .applicationGrid {
          display: grid;
          gap: 18px;
        }

        .metricGrid {
          grid-template-columns: repeat(4, 1fr);
          padding-top: 30px;
        }

        .metricCard {
          padding: 26px;
        }

        .metricCard.premium {
          background: linear-gradient(145deg, #10291f, #1f4f3c);
          color: white;
        }

        .metricCard.premium p,
        .metricCard.premium span {
          color: rgba(255, 255, 255, 0.76);
        }

        .metricCard p {
          color: #b88a2e;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 12px;
          margin: 0 0 10px;
        }

        .metricCard strong {
          display: block;
          font-size: 48px;
          letter-spacing: -0.07em;
          line-height: 1;
        }

        .metricCard span {
          display: block;
          color: #5f6b66;
          margin-top: 8px;
          font-weight: 800;
        }

        .sectionHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: end;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .actionGrid,
        .growthGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .actionGrid div,
        .growthGrid div,
        .applicationCard,
        .settingsCard {
          padding: 28px;
        }

        .actionGrid span,
        .growthGrid span {
          color: #b88a2e;
          font-size: 30px;
          font-weight: 1000;
        }

        .eventGrid {
          grid-template-columns: repeat(3, 1fr);
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

        .eventImage span,
        .listImage span {
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
        .listBody {
          padding: 24px;
        }

        .eventBody p,
        .listBody p {
          color: #b88a2e;
          font-weight: 950;
          margin: 0 0 8px;
          text-transform: uppercase;
          font-size: 12px;
        }

        .pillGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 16px 0;
        }

        .eventBody button,
        .listBody button {
          width: 100%;
        }

        .insightPanel {
          padding: 38px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .listStack {
          display: grid;
          gap: 18px;
        }

        .listCard {
          display: grid;
          grid-template-columns: 280px 1fr;
          overflow: hidden;
        }

        .listImage {
          min-height: 260px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .emptyState {
          padding: 42px;
          text-align: center;
        }

        .applicationGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        input {
          width: 100%;
          border: 1px solid #d8ccb5;
          border-radius: 18px;
          padding: 14px 16px;
          font: inherit;
          background: white;
          color: #10291f;
        }

        @media (max-width: 980px) {
          .hero,
          .metricGrid,
          .eventGrid,
          .actionGrid,
          .growthGrid,
          .applicationGrid,
          .listCard {
            grid-template-columns: 1fr;
          }

          section {
            padding: 50px 16px;
          }

          .hero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 52px;
          }

          .insightPanel {
            display: grid;
          }

          .listImage {
            min-height: 220px;
          }

          .heroActions button,
          .buttonRow button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}