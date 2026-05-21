"use client";

import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  clearProfileRoleCache,
  getAuthSession,
  getAuthUser,
  requireOrganizerDashboard,
} from "@/lib/auth";
import {
  AppFilterTab,
  calcOrganizerProfileStrength,
  countByStatus,
  formatBoothPrice,
  formatDashboardDate,
  statusBadgeClass,
  statusLabel,
} from "@/lib/dashboard";
import { deleteEventCascade, duplicateEventRecord } from "@/lib/events";
import { supabase } from "@/lib/supabase";

type ApplicationRow = {
  id: string;
  status?: string;
  created_at?: string;
  vendor_id?: string;
  event_id?: string;
  business_name?: string;
  slug?: string;
  category?: string;
  event_title?: string;
  event_city?: string;
  event_state?: string;
  event_date?: string;
  events?: Record<string, unknown> | null;
};

export default function OrganizerDashboardPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [organizerProfile, setOrganizerProfile] =
    useState<Record<string, unknown> | null>(null);
  const [myEvents, setMyEvents] = useState<Record<string, unknown>[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [appFilter, setAppFilter] = useState<AppFilterTab>("all");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [duplicatingEventId, setDuplicatingEventId] = useState<string | null>(
    null
  );
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);

    const auth = await requireOrganizerDashboard();
    if (!auth) return;

    const userId = auth.user.id;

    const [{ data: profileData }, { data: organizerProfileData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase
          .from("organizer_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    setProfile(profileData);
    setOrganizerProfile(organizerProfileData);

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    setMyEvents((eventsData as Record<string, unknown>[]) || []);

    const eventIds = (eventsData || []).map((event) => String(event.id));

    if (eventIds.length > 0) {
      const { data: appData, error: appError } = await supabase
        .from("event_applications_with_vendors")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (!appError && appData) {
        setApplications(appData as ApplicationRow[]);
      } else {
        const { data: attendanceData } = await supabase
          .from("event_attendance")
          .select("id, status, created_at, vendor_id, event_id, events(*)")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });

        const vendorIds = [
          ...new Set(
            (attendanceData || [])
              .map((row) => row.vendor_id)
              .filter(Boolean) as string[]
          ),
        ];

        let vendorMap: Record<string, Record<string, unknown>> = {};

        if (vendorIds.length > 0) {
          const { data: vendors } = await supabase
            .from("vendor_profiles")
            .select("user_id, business_name, slug, category")
            .in("user_id", vendorIds);

          vendorMap = Object.fromEntries(
            (vendors || []).map((vendor) => [String(vendor.user_id), vendor])
          );
        }

        setApplications(
          (attendanceData || []).map((row) => {
            const vendor = vendorMap[String(row.vendor_id)] || {};
            const event = Array.isArray(row.events) ? row.events[0] : row.events;

            return {
              id: row.id,
              status: row.status,
              created_at: row.created_at,
              vendor_id: row.vendor_id,
              event_id: row.event_id,
              business_name: String(vendor.business_name || ""),
              slug: String(vendor.slug || ""),
              category: String(vendor.category || ""),
              event_title: String((event as Record<string, unknown>)?.title || ""),
              event_city: String((event as Record<string, unknown>)?.city || ""),
              event_state: String((event as Record<string, unknown>)?.state || ""),
              event_date: String(
                (event as Record<string, unknown>)?.event_date || ""
              ),
              events: event as Record<string, unknown>,
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

  const organizerName = String(
    organizerProfile?.organizer_name || profile?.business_name || ""
  );

  const profileScore = useMemo(
    () => calcOrganizerProfileStrength(organizerProfile, profile),
    [organizerProfile, profile]
  );

  const liveEvents = myEvents.filter((e) => e.accepting_vendors !== false);
  const closedEvents = myEvents.filter((e) => e.accepting_vendors === false);

  const appsByEvent = useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) {
      const eid = String(app.event_id || "");
      if (!eid) continue;
      map[eid] = (map[eid] || 0) + 1;
    }
    return map;
  }, [applications]);

  const estimatedRevenue = useMemo(() => {
    return myEvents.reduce((total, event) => {
      const booth = Number(event.booth_price || 0);
      const approvedForEvent = applications.filter(
        (app) =>
          String(app.event_id) === String(event.id) &&
          statusLabel(app.status) === "Approved"
      ).length;
      return total + booth * approvedForEvent;
    }, 0);
  }, [myEvents, applications]);

  const filteredApplications = useMemo(() => {
    if (appFilter === "pending")
      return applications.filter((a) => statusLabel(a.status) === "Pending");
    if (appFilter === "approved")
      return applications.filter((a) => statusLabel(a.status) === "Approved");
    if (appFilter === "rejected")
      return applications.filter((a) => statusLabel(a.status) === "Rejected");
    if (appFilter === "waitlisted")
      return applications.filter((a) => statusLabel(a.status) === "Waitlisted");
    return applications;
  }, [applications, appFilter]);

  async function updateApplicationStatus(
    applicationId: string,
    status: string
  ) {
    setActingId(applicationId);
    const { error } = await supabase
      .from("event_attendance")
      .update({ status })
      .eq("id", applicationId);

    if (error) alert(error.message);
    else {
      alert(`Application marked as ${statusLabel(status)}.`);
      await loadDashboard();
    }
    setActingId(null);
  }

  async function removeApplication(applicationId: string) {
    if (!confirm("Remove this application from your queue?")) return;

    setActingId(applicationId);
    const { error } = await supabase
      .from("event_attendance")
      .delete()
      .eq("id", applicationId);

    if (error) alert(error.message);
    else await loadDashboard();
    setActingId(null);
  }

  async function toggleAcceptingVendors(event: Record<string, unknown>) {
    const eventId = String(event.id);
    const isOpen = event.accepting_vendors !== false;
    setActingId(eventId);

    const { error } = await supabase
      .from("events")
      .update({ accepting_vendors: !isOpen })
      .eq("id", eventId);

    if (error) alert(error.message);
    else await loadDashboard();
    setActingId(null);
  }

  async function deleteEvent(eventId: string, eventTitle: string) {
    const confirmed = confirm(
      `Delete "${eventTitle}"?\n\nThis removes the event and related vendor applications. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingEventId(eventId);
    const { user } = await getAuthUser();
    if (!user) {
      window.location.href = "/login/organizer";
      return;
    }

    const result = await deleteEventCascade(eventId, user.id);
    if (!result.ok) alert(result.error || "Could not delete event.");
    else await loadDashboard();
    setDeletingEventId(null);
  }

  async function duplicateEvent(source: Record<string, unknown>) {
    const { user } = await getAuthUser();
    if (!user) {
      window.location.href = "/login/organizer";
      return;
    }

    setDuplicatingEventId(String(source.id));
    const { data, error } = await duplicateEventRecord(source, user.id);
    setDuplicatingEventId(null);

    if (error || !data?.id) {
      alert(error?.message || "Could not duplicate event.");
      return;
    }

    window.location.href = `/events/${data.id}`;
  }

  async function logout() {
    const { user } = await getAuthSession();
    if (user?.id) clearProfileRoleCache(user.id);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const appTabs: { id: AppFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: applications.length },
    {
      id: "pending",
      label: "Pending",
      count: countByStatus(applications, "requested"),
    },
    {
      id: "approved",
      label: "Approved",
      count: countByStatus(applications, "approved"),
    },
    {
      id: "rejected",
      label: "Rejected",
      count: countByStatus(applications, "rejected"),
    },
    {
      id: "waitlisted",
      label: "Waitlisted",
      count: countByStatus(applications, "waitlist"),
    },
  ];

  return (
    <main className="vehDash dashboardPage">
      <div className="vehDashShell">
        <section className="vehDashHero">
          <div className="vehDashHeroMain">
            <p className="vehDashEyebrow">Organizer Command Center</p>
            <h1>
              Welcome back
              {organizerName ? `, ${organizerName}` : ""}
            </h1>
            <p className="vehDashHeroText">
              Manage events, review vendor applications, and grow visibility
              from one professional organizer hub.
            </p>
            <div className="vehDashActions">
              <button
                type="button"
                className="vehDashBtn"
                onClick={() => (window.location.href = "/create-event")}
              >
                Create Event
              </button>
              {organizerProfile?.slug ? (
                <button
                  type="button"
                  className="vehDashBtn vehDashBtnSecondary"
                  onClick={() =>
                    (window.location.href = `/organizers/${organizerProfile.slug}`)
                  }
                >
                  Public Profile
                </button>
              ) : null}
              <button
                type="button"
                className="vehDashBtn vehDashBtnSecondary"
                onClick={() =>
                  (window.location.href = "/dashboard/organizer/setup")
                }
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="vehDashBtn vehDashBtnGold"
                onClick={() => (window.location.href = "/advertise")}
              >
                Advertise Event
              </button>
              <button
                type="button"
                className="vehDashBtn vehDashBtnDanger"
                onClick={logout}
              >
                Log Out
              </button>
            </div>
          </div>
          <aside className="vehDashHeroAside">
            <p className="vehDashEyebrow">Organizer Score</p>
            <div className="vehDashScoreRing">
              <div className="vehDashScoreInner">{profileScore}%</div>
            </div>
            <p className="vehDashMuted">
              {myEvents.length} event{myEvents.length === 1 ? "" : "s"} in your
              portfolio
            </p>
          </aside>
        </section>

        <div className="vehDashMetrics">
          <div className="vehDashMetric">
            <strong>{myEvents.length}</strong>
            <span>Total Events</span>
          </div>
          <div className="vehDashMetric">
            <strong>{liveEvents.length}</strong>
            <span>Accepting Vendors</span>
          </div>
          <div className="vehDashMetric">
            <strong>{closedEvents.length}</strong>
            <span>Closed</span>
          </div>
          <div className="vehDashMetric">
            <strong>{countByStatus(applications, "requested")}</strong>
            <span>Pending Apps</span>
          </div>
          <div className="vehDashMetric">
            <strong>{countByStatus(applications, "approved")}</strong>
            <span>Approved</span>
          </div>
          <div className="vehDashMetric">
            <strong>{countByStatus(applications, "rejected")}</strong>
            <span>Rejected</span>
          </div>
          <div className="vehDashMetric">
            <strong>{countByStatus(applications, "waitlist")}</strong>
            <span>Waitlisted</span>
          </div>
          <div className="vehDashMetric vehDashMetricPremium">
            <strong>${estimatedRevenue.toLocaleString()}</strong>
            <span>Est. Booth Revenue</span>
          </div>
        </div>

        <section className="vehDashSection">
          <div className="vehDashSectionHead">
            <div>
              <p className="vehDashEyebrow">My Events</p>
              <h2>Event portfolio</h2>
            </div>
            <button
              type="button"
              className="vehDashBtn"
              onClick={() => (window.location.href = "/create-event")}
            >
              Create New Event
            </button>
          </div>

          {loading ? (
            <p className="vehDashMuted">Loading events...</p>
          ) : myEvents.length === 0 ? (
            <PremiumEmptyState
              eyebrow="Organizer Portfolio"
              title="No events listed yet"
              description="Create your first festival, fair, market, or expo listing to start receiving vendor applications."
              actionLabel="Create Event"
              onAction={() => (window.location.href = "/create-event")}
              secondaryLabel={
                organizerProfile?.slug ? undefined : "Create Organizer Profile"
              }
              onSecondary={
                organizerProfile?.slug
                  ? undefined
                  : () => (window.location.href = "/dashboard/organizer/setup")
              }
            />
          ) : (
            <div className="vehDashEventGrid">
              {myEvents.map((event) => {
                const eventId = String(event.id);
                const isOpen = event.accepting_vendors !== false;
                const busy =
                  actingId === eventId ||
                  deletingEventId === eventId ||
                  duplicatingEventId === eventId;

                return (
                  <article className="vehDashCard" key={eventId}>
                    <div
                      className="vehDashEventImage"
                      style={{
                        backgroundImage: `url(${
                          event.image_url ||
                          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                        })`,
                      }}
                    >
                      <span>
                        {event.is_featured ? "Featured" : isOpen ? "Live" : "Closed"}
                      </span>
                    </div>
                    <h3>{String(event.title || "Untitled")}</h3>
                    <p className="vehDashCardMeta">
                      {formatDashboardDate(String(event.event_date || ""))} ·{" "}
                      {String(event.city || "")}, {String(event.state || "")}
                    </p>
                    <div className="vehDashPills">
                      <span>Booth {formatBoothPrice(event.booth_price)}</span>
                      <span>{String(event.expected_visitors || "Visitors TBD")}</span>
                      <span>{appsByEvent[eventId] || 0} applications</span>
                      <span className={isOpen ? statusBadgeClass("approved") : statusBadgeClass("closed")}>
                        {isOpen ? "Accepting" : "Closed"}
                      </span>
                    </div>
                    <div className="vehDashBtnRow">
                      <button
                        type="button"
                        className="vehDashBtn"
                        disabled={busy}
                        onClick={() =>
                          (window.location.href = `/events/${eventId}`)
                        }
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnSecondary"
                        disabled={busy}
                        onClick={() =>
                          (window.location.href = `/dashboard/organizer/events/${eventId}/edit`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnSecondary"
                        disabled={busy}
                        onClick={() => duplicateEvent(event)}
                      >
                        {duplicatingEventId === eventId ? "…" : "Duplicate"}
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnGold"
                        disabled={busy}
                        onClick={() => toggleAcceptingVendors(event)}
                      >
                        {isOpen ? "Close Vendors" : "Open Vendors"}
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnDanger"
                        disabled={busy}
                        onClick={() =>
                          deleteEvent(eventId, String(event.title || "Event"))
                        }
                      >
                        {deletingEventId === eventId ? "…" : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="vehDashSection">
          <div className="vehDashSectionHead">
            <div>
              <p className="vehDashEyebrow">Vendor Applications</p>
              <h2>Application command center</h2>
            </div>
          </div>

          <div className="vehDashTabs">
            {appTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  appFilter === tab.id ? "vehDashTab vehDashTabActive" : "vehDashTab"
                }
                onClick={() => setAppFilter(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {applications.length === 0 ? (
            <PremiumEmptyState
              eyebrow="Vendor Applications"
              title="No applications yet"
              description="Share your public event link and promote listings to attract qualified vendors."
              actionLabel="Create Event"
              onAction={() => (window.location.href = "/create-event")}
              secondaryLabel="Advertise Event"
              onSecondary={() => (window.location.href = "/advertise")}
            />
          ) : filteredApplications.length === 0 ? (
            <p className="vehDashMuted">No applications in this filter.</p>
          ) : (
            <div className="vehDashCardGrid">
              {filteredApplications.map((application) => {
                const busy = actingId === application.id;

                return (
                  <article className="vehDashCard" key={application.id}>
                    <span className={statusBadgeClass(application.status)}>
                      {statusLabel(application.status)}
                    </span>
                    <h3>
                      {application.business_name ||
                        application.event_title ||
                        "Vendor Application"}
                    </h3>
                    <p className="vehDashCardMeta">
                      {application.event_title
                        ? `Event: ${application.event_title}`
                        : "Event application"}{" "}
                      · Applied {formatDashboardDate(application.created_at)}
                    </p>
                    <div className="vehDashPills">
                      <span>{application.category || "Vendor"}</span>
                      <span>
                        {application.event_city}, {application.event_state}
                      </span>
                    </div>
                    <div className="vehDashBtnRow">
                      {application.slug ? (
                        <button
                          type="button"
                          className="vehDashBtn vehDashBtnSecondary"
                          disabled={busy}
                          onClick={() =>
                            (window.location.href = `/vendors/${application.slug}`)
                          }
                        >
                          View Vendor
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="vehDashBtn"
                        disabled={busy}
                        onClick={() =>
                          updateApplicationStatus(application.id, "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnSecondary"
                        disabled={busy}
                        onClick={() =>
                          updateApplicationStatus(application.id, "waitlist")
                        }
                      >
                        Waitlist
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnDanger"
                        disabled={busy}
                        onClick={() =>
                          updateApplicationStatus(application.id, "rejected")
                        }
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="vehDashBtn vehDashBtnDanger"
                        disabled={busy}
                        onClick={() => removeApplication(application.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="vehDashTips">
          <p className="vehDashEyebrow">Grow Your Event</p>
          <h2>Make listings convert better vendors</h2>
          <ul>
            <li>Add strong event photos and clear booth pricing</li>
            <li>Add booth rules and vendor fit details</li>
            <li>Link organizer social profiles for trust</li>
            <li>Keep applications open while you are actively filling booths</li>
            <li>Promote your public event page to local vendor communities</li>
          </ul>
          <div className="vehDashBtnRow">
            <button
              type="button"
              className="vehDashBtn vehDashBtnSecondary"
              onClick={() =>
                (window.location.href = "/dashboard/organizer/setup")
              }
            >
              Edit Organizer Profile
            </button>
            <button
              type="button"
              className="vehDashBtn"
              onClick={() => (window.location.href = "/create-event")}
            >
              Create New Event
            </button>
            <button
              type="button"
              className="vehDashBtn vehDashBtnGold"
              onClick={() => (window.location.href = "/advertise")}
            >
              Advertise Event
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
