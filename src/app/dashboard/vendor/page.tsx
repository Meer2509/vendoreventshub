"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VendorDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
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

    const { data: vendorProfileData } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setVendorProfile(vendorProfileData);

    const { data: savedData } = await supabase
      .from("saved_events")
      .select("id, created_at, events(*)")
      .eq("vendor_id", userId)
      .order("created_at", { ascending: false });

    setSavedEvents(savedData || []);

    const { data: applicationData } = await supabase
      .from("event_attendance")
      .select("id, status, created_at, events(*)")
      .eq("vendor_id", userId)
      .order("created_at", { ascending: false });

    setApplications(applicationData || []);

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const profileStrength = useMemo(() => {
    const source = vendorProfile || profile;
    let score = 20;

    if (source?.business_name) score += 20;
    if (source?.logo_url) score += 15;
    if (source?.banner_url) score += 15;
    if (source?.short_description || source?.description) score += 15;
    if (source?.website || source?.website_url) score += 10;
    if (source?.facebook || source?.facebook_url) score += 5;
    if (source?.instagram || source?.instagram_url) score += 5;
    if (source?.tiktok || source?.tiktok_url) score += 5;
    if (source?.phone) score += 10;

    return Math.min(score, 100);
  }, [profile, vendorProfile]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="dashboardPage">
      <section className="hero">
        <div>
          <p className="eyebrow">Vendor Dashboard</p>

          <h1>
            Welcome back
            {profile?.business_name
              ? `, ${profile.business_name}`
              : ""}
          </h1>

          <p className="heroText">
            Manage your business profile, saved events,
            applications, and marketplace visibility.
          </p>

          <div className="heroButtons">
            <button
              onClick={() =>
                (window.location.href = "/profile/setup")
              }
            >
              Edit Profile
            </button>

            {vendorProfile?.slug && (
              <button
                className="secondary"
                onClick={() =>
                  (window.location.href = `/vendors/${vendorProfile.slug}`)
                }
              >
                View Public Profile
              </button>
            )}

            <button
              className="secondary"
              onClick={() =>
                (window.location.href = "/events")
              }
            >
              Find Events
            </button>

            <button
              className="secondary"
              onClick={logout}
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="scoreCard">
          <p className="eyebrow">
            Profile Strength
          </p>

          <div className="scoreCircle">
            {profileStrength}%
          </div>

          <p>
            Complete your vendor profile to
            attract more organizers and build
            trust.
          </p>
        </div>
      </section>

      <section className="metrics">
        <div className="metricCard">
          <strong>
            {savedEvents.length}
          </strong>
          <span>Saved Events</span>
        </div>

        <div className="metricCard">
          <strong>
            {applications.length}
          </strong>
          <span>Applications</span>
        </div>

        <div className="metricCard premium">
          <strong>
            {profileStrength}%
          </strong>
          <span>Profile Strength</span>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2>Saved Events</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : savedEvents.length === 0 ? (
          <div className="emptyState">
            <h3>No saved events yet</h3>
            <p>Browse events and save opportunities you want to revisit.</p>
            <button onClick={() => (window.location.href = "/events")}>
              Explore Events
            </button>
          </div>
        ) : (
          <div className="cardGrid">
            {savedEvents.map((saved) => (
              <div className="eventCard" key={saved.id}>
                <p className="status">Saved</p>
                <h3>{saved.events?.title || "Event"}</h3>
                <p>
                  {saved.events?.city}, {saved.events?.state}
                </p>
                {saved.events?.id && (
                  <button
                    onClick={() =>
                      (window.location.href = `/events/${saved.events.id}`)
                    }
                  >
                    View Event
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2>Your Applications</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <div className="emptyState">
            <h3>No applications yet</h3>
            <p>
              Apply to events and track your
              approvals here.
            </p>
          </div>
        ) : (
          <div className="cardGrid">
            {applications.map((app) => (
              <div
                className="eventCard"
                key={app.id}
              >
                <p className="status">
                  {app.status}
                </p>

                <h3>
                  {app.events?.title}
                </h3>

                <p>
                  {app.events?.city},{" "}
                  {app.events?.state}
                </p>

                <button
                  onClick={() =>
                    (window.location.href =
                      `/events/${app.events?.id}`)
                  }
                >
                  View Event
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .dashboardPage {
          background: #f7f1e6;
          min-height: 100vh;
          color: #10291f;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 70px 18px;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 30px;
          align-items: center;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        h1 {
          font-size: clamp(44px, 8vw, 82px);
          line-height: 0.9;
          margin: 12px 0;
        }

        h2 {
          font-size: 42px;
        }

        .heroText {
          color: #5f6b66;
          line-height: 1.8;
          max-width: 700px;
        }

        .heroButtons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          padding: 14px 22px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 900;
        }

        button.secondary {
          background: white;
          color: #10291f;
          border: 1px solid #ddd;
        }

        .scoreCard,
        .metricCard,
        .eventCard,
        .emptyState {
          background: white;
          border-radius: 30px;
          border: 1px solid #eadfc9;
          padding: 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,.06);
        }

        .scoreCircle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f7f1e6;
          border: 12px solid #b88a2e;
          font-size: 40px;
          font-weight: 900;
          margin: 20px auto;
        }

        .metrics,
        .cardGrid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
        }

        .metricCard strong {
          font-size: 44px;
          display: block;
        }

        .premium {
          background: #10291f;
          color: white;
        }

        .status {
          color: #b88a2e;
          font-weight: 900;
          text-transform: uppercase;
        }

        @media(max-width:980px){
          .hero,
          .metrics,
          .cardGrid{
            grid-template-columns:1fr;
          }

          h1{
            font-size:52px;
          }
        }
      `}</style>
    </main>
  );
}