"use client";

import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  clearProfileRoleCache,
  getAuthSession,
  requireVendorDashboard,
} from "@/lib/auth";
import {
  calcVendorProfileStrength,
  countByStatus,
  eventVendorScore,
  formatBoothPrice,
  formatDashboardDate,
  joinedEvent,
  statusBadgeClass,
  statusLabel,
  type PipelineTab,
} from "@/lib/dashboard";
import { supabase } from "@/lib/supabase";

type SavedRow = {
  id: string;
  created_at?: string;
  events: Record<string, unknown> | null;
};

type ApplicationRow = {
  id: string;
  status?: string;
  created_at?: string;
  events: Record<string, unknown> | null;
};

export default function VendorDashboardPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [vendorProfile, setVendorProfile] =
    useState<Record<string, unknown> | null>(null);
  const [savedEvents, setSavedEvents] = useState<SavedRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [recommendations, setRecommendations] = useState<
    Record<string, unknown>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PipelineTab>("all");
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    const auth = await requireVendorDashboard();
    if (!auth) return;

    const userId = auth.user.id;

    const [{ data: profileData }, { data: vendorProfileData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase
          .from("vendor_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    setProfile(profileData);
    setVendorProfile(vendorProfileData);

    const { data: savedData } = await supabase
      .from("saved_events")
      .select("id, created_at, events(*)")
      .eq("vendor_id", userId)
      .order("created_at", { ascending: false });

    setSavedEvents(
      (savedData || []).map((row) => ({
        id: String(row.id),
        created_at: row.created_at as string | undefined,
        events: joinedEvent(row.events),
      }))
    );

    const { data: applicationData } = await supabase
      .from("event_attendance")
      .select("id, status, created_at, events(*)")
      .eq("vendor_id", userId)
      .order("created_at", { ascending: false });

    setApplications(
      (applicationData || []).map((row) => ({
        id: String(row.id),
        status: row.status as string | undefined,
        created_at: row.created_at as string | undefined,
        events: joinedEvent(row.events),
      }))
    );

    const appliedIds = new Set(
      (applicationData || [])
        .map((row) => {
          const ev = joinedEvent(row.events);
          return ev?.id ? String(ev.id) : "";
        })
        .filter(Boolean)
    );

    const savedIds = new Set(
      (savedData || [])
        .map((row) => {
          const ev = joinedEvent(row.events);
          return ev?.id ? String(ev.id) : "";
        })
        .filter(Boolean)
    );

    const { data: eventPool } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);

    const vendorState = String(
      vendorProfileData?.state || profileData?.state || ""
    ).toLowerCase();
    const vendorCategory = String(
      vendorProfileData?.category || ""
    ).toLowerCase();

    const filtered = (eventPool || []).filter((event) => {
      if (event.accepting_vendors === false) return false;
      const id = String(event.id);
      if (appliedIds.has(id) || savedIds.has(id)) return false;
      return true;
    });

    const scored = [...filtered].sort((a, b) => {
      const aState = String(a.state || "").toLowerCase() === vendorState ? 1 : 0;
      const bState = String(b.state || "").toLowerCase() === vendorState ? 1 : 0;
      if (bState !== aState) return bState - aState;

      const aCat =
        String(a.category || "").toLowerCase() === vendorCategory ? 1 : 0;
      const bCat =
        String(b.category || "").toLowerCase() === vendorCategory ? 1 : 0;
      if (bCat !== aCat) return bCat - aCat;

      return (
        new Date(String(b.created_at || 0)).getTime() -
        new Date(String(a.created_at || 0)).getTime()
      );
    });

    setRecommendations(scored.slice(0, 6));
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const profileStrength = useMemo(
    () => calcVendorProfileStrength(vendorProfile, profile),
    [vendorProfile, profile]
  );

  const businessName = String(
    vendorProfile?.business_name || profile?.business_name || ""
  );

  const savedEventIds = useMemo(
    () =>
      new Set(
        savedEvents
          .map((row) => {
            const ev = row.events;
            return ev?.id ? String(ev.id) : "";
          })
          .filter(Boolean)
      ),
    [savedEvents]
  );

  const appliedEventIds = useMemo(
    () =>
      new Set(
        applications
          .map((row) => {
            const ev = row.events;
            return ev?.id ? String(ev.id) : "";
          })
          .filter(Boolean)
      ),
    [applications]
  );

  const pendingApps = useMemo(
    () => applications.filter((a) => statusLabel(a.status) === "Pending"),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    if (activeTab === "pending")
      return applications.filter((a) => statusLabel(a.status) === "Pending");
    if (activeTab === "approved")
      return applications.filter((a) => statusLabel(a.status) === "Approved");
    if (activeTab === "rejected")
      return applications.filter((a) => statusLabel(a.status) === "Rejected");
    if (activeTab === "waitlisted")
      return applications.filter((a) => statusLabel(a.status) === "Waitlisted");
    if (activeTab === "applied") return applications;
    return applications;
  }, [applications, activeTab]);

  async function logout() {
    const { user } = await getAuthSession();
    if (user?.id) clearProfileRoleCache(user.id);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function removeSaved(savedId: string) {
    setActingId(savedId);
    const { error } = await supabase
      .from("saved_events")
      .delete()
      .eq("id", savedId);
    if (error) alert(error.message);
    else await loadDashboard();
    setActingId(null);
  }

  async function saveEventById(eventId: string) {
    const auth = await requireVendorDashboard();
    if (!auth) return;

    setActingId(eventId);
    const { error } = await supabase.from("saved_events").insert({
      vendor_id: auth.user.id,
      event_id: eventId,
    });

    if (error) {
      alert(
        error.message.includes("duplicate")
          ? "Event already saved."
          : error.message
      );
    } else await loadDashboard();
    setActingId(null);
  }

  async function applyToEvent(eventId: string) {
    const auth = await requireVendorDashboard();
    if (!auth) return;

    setActingId(eventId);
    const { error } = await supabase.from("event_attendance").insert({
      event_id: eventId,
      vendor_id: auth.user.id,
      status: "requested",
    });

    if (error) {
      alert(
        error.message.includes("duplicate")
          ? "You already applied for this event."
          : error.message
      );
    } else {
      alert("Application submitted.");
      await loadDashboard();
    }
    setActingId(null);
  }

  async function withdrawApplication(applicationId: string) {
    if (!confirm("Withdraw this application?")) return;

    setActingId(applicationId);
    const { error } = await supabase
      .from("event_attendance")
      .delete()
      .eq("id", applicationId);

    if (error) alert(error.message);
    else await loadDashboard();
    setActingId(null);
  }

  function renderEventActions(
    event: Record<string, unknown>,
    opts: {
      savedId?: string;
      applicationId?: string;
      showRemoveSaved?: boolean;
      showWithdraw?: boolean;
    }
  ) {
    const eventId = String(event.id);
    const isSaved = savedEventIds.has(eventId);
    const busy = actingId === eventId || actingId === opts.savedId;

    return (
      <div className="vehDashBtnRow">
        <button
          type="button"
          className="vehDashBtn"
          disabled={busy}
          onClick={() => (window.location.href = `/events/${eventId}`)}
        >
          View Details
        </button>
        {!opts.showWithdraw && !appliedEventIds.has(eventId) && (
          <button
            type="button"
            className="vehDashBtn vehDashBtnGold"
            disabled={busy || event.accepting_vendors === false}
            onClick={() => applyToEvent(eventId)}
          >
            Apply
          </button>
        )}
        {opts.showWithdraw && opts.applicationId && (
          <button
            type="button"
            className="vehDashBtn vehDashBtnDanger"
            disabled={busy}
            onClick={() => withdrawApplication(opts.applicationId!)}
          >
            Withdraw
          </button>
        )}
        {!isSaved && !opts.showRemoveSaved && (
          <button
            type="button"
            className="vehDashBtn vehDashBtnSecondary"
            disabled={busy}
            onClick={() => saveEventById(eventId)}
          >
            Save
          </button>
        )}
        {opts.showRemoveSaved && opts.savedId && (
          <button
            type="button"
            className="vehDashBtn vehDashBtnDanger"
            disabled={busy}
            onClick={() => removeSaved(opts.savedId!)}
          >
            Remove Saved
          </button>
        )}
      </div>
    );
  }

  function renderEventCard(
    event: Record<string, unknown>,
    extras?: {
      badge?: string;
      savedId?: string;
      applicationId?: string;
      showRemoveSaved?: boolean;
      showWithdraw?: boolean;
    }
  ) {
    const score = eventVendorScore(event);

    return (
      <article className="vehDashCard" key={String(event.id) + (extras?.savedId || "")}>
        {extras?.badge && (
          <span className={statusBadgeClass(extras.badge)}>{extras.badge}</span>
        )}
        <h3>{String(event.title || "Event")}</h3>
        <p className="vehDashCardMeta">
          {formatDashboardDate(String(event.event_date || ""))} · {String(event.city || "")},{" "}
          {String(event.state || "")}
        </p>
        <div className="vehDashPills">
          <span>Booth {formatBoothPrice(event.booth_price)}</span>
          <span>{String(event.expected_visitors || "Visitors TBD")}</span>
          {score !== null && <span>Vendor Score™ {score}</span>}
        </div>
        {renderEventActions(event, {
          savedId: extras?.savedId,
          applicationId: extras?.applicationId,
          showRemoveSaved: extras?.showRemoveSaved,
          showWithdraw: extras?.showWithdraw,
        })}
      </article>
    );
  }

  const pipelineTabs: { id: PipelineTab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "saved", label: "Saved", count: savedEvents.length },
    { id: "applied", label: "Applied", count: applications.length },
    { id: "pending", label: "Pending", count: pendingApps.length },
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
            <p className="vehDashEyebrow">Vendor Command Center</p>
            <h1>
              Welcome back
              {businessName ? `, ${businessName}` : ""}
            </h1>
            <p className="vehDashHeroText">
              Track saved opportunities, applications, and recommended events —
              all connected to live marketplace data.
            </p>
            <div className="vehDashActions">
              {vendorProfile?.slug ? (
                <button
                  type="button"
                  className="vehDashBtn vehDashBtnSecondary"
                  onClick={() =>
                    (window.location.href = `/vendors/${vendorProfile.slug}`)
                  }
                >
                  Public Profile
                </button>
              ) : null}
              <button
                type="button"
                className="vehDashBtn vehDashBtnSecondary"
                onClick={() => (window.location.href = "/profile/setup")}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="vehDashBtn"
                onClick={() => (window.location.href = "/events")}
              >
                Find Events
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
            <p className="vehDashEyebrow">Profile Strength</p>
            <div className="vehDashScoreRing">
              <div className="vehDashScoreInner">{profileStrength}%</div>
            </div>
            <p className="vehDashMuted">
              Complete your vendor profile to improve trust with organizers.
            </p>
          </aside>
        </section>

        <div className="vehDashMetrics">
          <div className="vehDashMetric">
            <strong>{savedEvents.length}</strong>
            <span>Saved Events</span>
          </div>
          <div className="vehDashMetric">
            <strong>{applications.length}</strong>
            <span>Applied</span>
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
            <strong>{pendingApps.length}</strong>
            <span>Pending</span>
          </div>
          <div className="vehDashMetric vehDashMetricPremium">
            <strong>{profileStrength}%</strong>
            <span>Profile Strength</span>
          </div>
        </div>

        <div className="vehDashTabs">
          {pipelineTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id ? "vehDashTab vehDashTabActive" : "vehDashTab"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined ? ` (${tab.count})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="vehDashMuted">Loading your command center...</p>
        ) : (
          <>
            {(activeTab === "all" || activeTab === "saved") && (
              <section className="vehDashSection">
                <div className="vehDashSectionHead">
                  <div>
                    <p className="vehDashEyebrow">Saved Events</p>
                    <h2>Opportunities you bookmarked</h2>
                  </div>
                </div>
                {savedEvents.length === 0 ? (
                  <PremiumEmptyState
                    eyebrow="Saved Events"
                    title="No saved events yet"
                    description="Browse the marketplace and save festivals, fairs, and markets you want to revisit before applying."
                    actionLabel="Find Events"
                    onAction={() => (window.location.href = "/events")}
                  />
                ) : (
                  <div className="vehDashCardGrid">
                    {savedEvents.map((saved) => {
                      const event = saved.events;
                      if (!event) return null;
                      return renderEventCard(event, {
                        badge: "saved",
                        savedId: saved.id,
                        showRemoveSaved: true,
                      });
                    })}
                  </div>
                )}
              </section>
            )}

            {(activeTab === "all" ||
              activeTab === "applied" ||
              activeTab === "pending" ||
              activeTab === "approved" ||
              activeTab === "rejected" ||
              activeTab === "waitlisted") && (
              <section className="vehDashSection">
                <div className="vehDashSectionHead">
                  <div>
                    <p className="vehDashEyebrow">Applications</p>
                    <h2>Your vendor pipeline</h2>
                  </div>
                </div>
                {filteredApplications.length === 0 ? (
                  <PremiumEmptyState
                    eyebrow="Applications"
                    title={
                      activeTab === "approved"
                        ? "No approved events yet"
                        : activeTab === "rejected"
                        ? "No rejected applications"
                        : "No applications yet"
                    }
                    description={
                      activeTab === "approved"
                        ? "Keep applying to strong matches — approvals will show here."
                        : activeTab === "rejected"
                        ? "No rejections on file. Stay focused on events that fit your category and location."
                        : "Apply to events as a vendor and track status updates here."
                    }
                    actionLabel="Find Events"
                    onAction={() => (window.location.href = "/events")}
                  />
                ) : (
                  <div className="vehDashCardGrid">
                    {filteredApplications.map((app) => {
                      const event = app.events;
                      if (!event) return null;
                      return renderEventCard(event, {
                        badge: app.status,
                        applicationId: app.id,
                        showWithdraw: true,
                      });
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "all" && (
              <section className="vehDashSection">
                <div className="vehDashSectionHead">
                  <div>
                    <p className="vehDashEyebrow">Recommendations</p>
                    <h2>Events matched to your profile</h2>
                  </div>
                </div>
                {recommendations.length === 0 ? (
                  <PremiumEmptyState
                    eyebrow="Recommendations"
                    title="No new recommendations right now"
                    description="Check back as more organizers publish events accepting vendors."
                    actionLabel="Browse Events"
                    onAction={() => (window.location.href = "/events")}
                  />
                ) : (
                  <div className="vehDashCardGrid">
                    {recommendations.map((event) =>
                      renderEventCard(event as Record<string, unknown>)
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
