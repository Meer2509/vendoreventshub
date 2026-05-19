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
  const visitors = Number(event?.expected_visitors || 0);
  const rating = Number(event?.rating || 0);
  const featured = Boolean(event?.is_featured);
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
  return Math.min(score, 98);
}

function getBoothValue(event: any) {
  const booth = Number(event?.booth_price || 0);
  if (!booth) return "Booth TBD";
  if (booth <= 100) return "Excellent Value";
  if (booth <= 250) return "Strong Value";
  if (booth <= 500) return "Moderate Value";
  return "Premium Fee";
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
      .eq("organizer_id", userData.user.id)
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
      .limit(3);

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

  const estimatedOrganizerRevenue = myEvents.reduce((total, event) => {
    const booth = Number(event.booth_price || 0);
    return total + booth * approvedCount;
  }, 0);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function removeSavedEvent(savedId: string) {
    const confirmDelete = confirm("Remove this event from your saved list?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("saved_events").delete().eq("id", savedId);

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
      if (error.message.includes("duplicate")) alert("You already applied for this event.");
      else alert(error.message);
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
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">VendorEventsHub Command Center</p>
          <h1>
            Welcome back{profile?.business_name ? `, ${profile.business_name}` : "."}
          </h1>
          <p className="muted">
            Manage saved opportunities, vendor applications, organizer tools,
            approvals, profile strength, and premium growth.
          </p>
          <p className="dashboardEmail">{email}</p>
        </div>

        <div className="heroActions">
          <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
            Explore Events
          </button>
          <button className="outlineBtn" onClick={logout}>
            Log Out
          </button>
        </div>
      </section>

      <section className="dashboardSavedSection">
        <div className="filterRow">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#0f3d2e" : "rgba(255,255,255,0.75)",
                color: activeTab === tab ? "#fffaf0" : "#0f3d2e",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "Overview" && (
        <>
          <section className="dashboardGrid">
            <div className="dashboardCard">
              <h3>Saved Events</h3>
              <p>Events you are watching before applying.</p>
              <strong>{savedEvents.length}</strong>
            </div>

            <div className="dashboardCard">
              <h3>My Applications</h3>
              <p>Requested, approved, and attended events.</p>
              <strong>{applications.length}</strong>
            </div>

            <div className="dashboardCard">
              <h3>Organizer Applicants</h3>
              <p>Vendors applying to your listed events.</p>
              <strong>{organizerApplications.length}</strong>
            </div>

            <div className="dashboardCard premiumCard">
              <h3>Growth Mode</h3>
              <p>Promote your brand or boost your events.</p>
              <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
                Explore Ads
              </button>
            </div>
          </section>

          <section className="dashboardSavedSection">
            <div className="sectionHeader">
              <div>
                <p className="goldEyebrow">Recommended Events</p>
                <h2>Smart opportunities to review next.</h2>
              </div>
            </div>

            <div className="luxEventGrid">
              {recommendedEvents.map((event) => (
                <article className="luxEventCard" key={event.id}>
                  <div
                    className="eventVisual"
                    style={{
                      backgroundImage: `url(${
                        event.image_url ||
                        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                      })`,
                    }}
                  >
                    <div className="eventOverlay">
                      <span>{getVendorScore(event)}/100 Vendor Score</span>
                    </div>
                  </div>

                  <div className="eventBody">
                    <div className="eventDate">{event.event_date || "Date coming soon"}</div>
                    <h3>{event.title}</h3>
                    <p className="muted">
                      {event.city}, {event.state} {event.zip_code}
                    </p>

                    <div className="pillGrid">
                      <span>${event.booth_price || "TBD"} Booth</span>
                      <span>{event.expected_visitors || "TBD"} Visitors</span>
                      <span>{getBoothValue(event)}</span>
                    </div>

                    <button
                      className="fullBtn"
                      onClick={() => (window.location.href = `/events/${event.id}`)}
                    >
                      View Intelligence
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "Saved" && (
        <section className="dashboardSavedSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Saved Opportunities</p>
              <h2>Your Vendor Intelligence Wallet</h2>
            </div>

            <button className="outlineBtn" onClick={() => (window.location.href = "/events")}>
              Browse More Events
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading saved events...</p>
          ) : savedEvents.length === 0 ? (
            <div className="emptyStateCard">
              <h3>No saved events yet.</h3>
              <p>Save events to compare vendor score, booth value, traffic, and risk.</p>
              <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
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
                      <span>{getVendorScore(event)}/100 Vendor Score</span>
                    </div>

                    <div className="marketEventBody">
                      <div className="eventDate">{event?.event_date || "Date coming soon"}</div>
                      <h3>{event?.title}</h3>
                      <p className="muted">
                        {event?.city}, {event?.state} {event?.zip_code}
                      </p>

                      <div className="marketStats">
                        <span>★ {event?.rating || "New"}</span>
                        <span>${event?.booth_price || "TBD"} booth</span>
                        <span>{event?.expected_visitors || "TBD"} visitors</span>
                        <span>{getBoothValue(event)}</span>
                      </div>

                      <div className="eventActions">
                        <button
                          className="fullBtn"
                          onClick={() => (window.location.href = `/events/${event?.id}`)}
                        >
                          View Intelligence
                        </button>
                        <button className="outlineBtn" onClick={() => applyToEvent(event?.id)}>
                          Apply
                        </button>
                        <button className="outlineBtn" onClick={() => removeSavedEvent(saved.id)}>
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
        <section className="dashboardSavedSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Application Tracker</p>
              <h2>Your event applications.</h2>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="emptyStateCard">
              <h3>No applications yet.</h3>
              <p>Apply to events and track requested, approved, and attended opportunities here.</p>
            </div>
          ) : (
            <div className="eventsList">
              {applications.map((application) => {
                const event = application.events;

                return (
                  <article className="marketEventCard" key={application.id}>
                    <div
                      className="marketEventImage"
                      style={{
                        backgroundImage: `url(${
                          event?.image_url ||
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                        })`,
                      }}
                    >
                      <span>{application.status}</span>
                    </div>

                    <div className="marketEventBody">
                      <div className="eventDate">{event?.event_date || "Date coming soon"}</div>
                      <h3>{event?.title}</h3>
                      <p className="muted">
                        {event?.city}, {event?.state} {event?.zip_code}
                      </p>

                      <div className="marketStats">
                        <span>Status: {application.status}</span>
                        <span>${event?.booth_price || "TBD"} booth</span>
                        <span>{event?.expected_visitors || "TBD"} visitors</span>
                      </div>

                      <button
                        className="fullBtn"
                        onClick={() => (window.location.href = `/events/${event?.id}`)}
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
          <section className="dashboardGrid">
            <div className="dashboardCard">
              <h3>My Events</h3>
              <p>Events you created and manage.</p>
              <strong>{myEvents.length}</strong>
            </div>

            <div className="dashboardCard">
              <h3>Pending Applicants</h3>
              <p>Vendors waiting for your review.</p>
              <strong>{pendingCount}</strong>
            </div>

            <div className="dashboardCard">
              <h3>Approved Vendors</h3>
              <p>Vendors accepted into your events.</p>
              <strong>{approvedCount}</strong>
            </div>

            <div className="dashboardCard premiumCard">
              <h3>Booth Revenue Estimate</h3>
              <p>Estimated from approved vendors and booth fees.</p>
              <strong>${estimatedOrganizerRevenue}</strong>
            </div>
          </section>

          <section className="dashboardSavedSection">
            <div className="sectionHeader">
              <div>
                <p className="goldEyebrow">Organizer Center</p>
                <h2>Your event portfolio.</h2>
              </div>

              <button className="goldBtn" onClick={() => (window.location.href = "/create-event")}>
                Create Event
              </button>
            </div>

            {myEvents.length === 0 ? (
              <div className="emptyStateCard">
                <h3>No organizer events yet.</h3>
                <p>Create your first event to manage listings, vendor applications, and visibility.</p>
              </div>
            ) : (
              <div className="eventsList">
                {myEvents.map((event) => (
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
                      <span>{getVendorScore(event)}/100 Event Score</span>
                    </div>

                    <div className="marketEventBody">
                      <div className="eventDate">{event.event_date || "Date coming soon"}</div>
                      <h3>{event.title}</h3>
                      <p className="muted">
                        {event.city}, {event.state} {event.zip_code}
                      </p>

                      <div className="marketStats">
                        <span>${event.booth_price || "TBD"} booth</span>
                        <span>{event.expected_visitors || "TBD"} visitors</span>
                        <span>{event.is_featured ? "Featured" : "Listed"}</span>
                      </div>

                      <div className="eventActions">
                        <button
                          className="fullBtn"
                          onClick={() => (window.location.href = `/events/${event.id}`)}
                        >
                          View Event
                        </button>
                        <button
                          className="outlineBtn"
                          onClick={() => setActiveTab("Vendor Applications")}
                        >
                          View Applicants
                        </button>
                        <button
                          className="outlineBtn"
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
        <section className="dashboardSavedSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Vendor Application Center</p>
              <h2>Approve, reject, or waitlist vendors.</h2>
            </div>
          </div>

          {organizerApplications.length === 0 ? (
            <div className="emptyStateCard">
              <h3>No vendor applications yet.</h3>
              <p>
                When vendors apply to your events, they will appear here for approval.
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

                    <div className="marketStats">
                      <span>Status: {application.status}</span>
                      <span>Vendor ID: {application.vendor_id?.slice(0, 8)}...</span>
                      <span>{event?.city}, {event?.state}</span>
                    </div>

                    <div className="applicationActions">
                      <button
                        className="goldBtn"
                        onClick={() =>
                          updateApplicationStatus(application.id, "approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="outlineBtn"
                        onClick={() =>
                          updateApplicationStatus(application.id, "waitlist")
                        }
                      >
                        Waitlist
                      </button>

                      <button
                        className="outlineBtn"
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
        <section className="dashboardSavedSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Premium Growth Tools</p>
              <h2>Turn visibility into applications, customers, and trust.</h2>
            </div>
          </div>

          <div className="featureGrid">
            <div className="featureBox">
              <span className="stepNumber">$49</span>
              <h3>Sponsored Placement</h3>
              <p>Promote your event or vendor brand across high-intent pages.</p>
              <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
                Start Advertising
              </button>
            </div>

            <div className="featureBox">
              <span className="stepNumber">PRO</span>
              <h3>Premium Vendor Profile</h3>
              <p>Rank higher in vendor discovery and build more organizer trust.</p>
              <button className="outlineBtn" onClick={() => (window.location.href = "/pricing")}>
                View Plans
              </button>
            </div>

            <div className="featureBox">
              <span className="stepNumber">AI</span>
              <h3>Vendor Profit Score</h3>
              <p>Future AI scoring to compare risk, traffic, booth value, and fit.</p>
              <button className="outlineBtn" onClick={() => (window.location.href = "/events")}>
                Explore Scores
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Settings" && (
        <section className="dashboardSavedSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Account Settings</p>
              <h2>Manage profile, account type, and trust signals.</h2>
            </div>
          </div>

          <div className="profileCard">
            <label>
              Account Email
              <input value={email || ""} readOnly />
            </label>

            <label>
              Current Account Type
              <input value={role} readOnly />
            </label>

            <button className="goldBtn" onClick={() => (window.location.href = "/profile/setup")}>
              Edit Profile
            </button>

            <button className="outlineBtn" onClick={() => (window.location.href = "/create-event")}>
              Become Organizer / Create Event
            </button>
          </div>
        </section>
      )}
    </main>
  );
}