"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[] | null>(null);
  const [reviewsAvailable, setReviewsAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        eventsRes,
        vendorsRes,
        organizersRes,
        appsRes,
        savedRes,
        reviewsRes,
      ] = await Promise.all([
        supabase.from("events").select("id, category, state, is_featured, accepting_vendors"),
        supabase.from("vendor_profiles").select("user_id"),
        supabase.from("organizer_profiles").select("user_id"),
        supabase.from("event_attendance").select("id"),
        supabase.from("saved_events").select("id"),
        supabase.from("reviews").select("id"),
      ]);

      if (eventsRes.error) alert(`events: ${eventsRes.error.message}`);
      if (vendorsRes.error) alert(`vendor_profiles: ${vendorsRes.error.message}`);
      if (organizersRes.error)
        alert(`organizer_profiles: ${organizersRes.error.message}`);
      if (appsRes.error) alert(`event_attendance: ${appsRes.error.message}`);
      if (savedRes.error) alert(`saved_events: ${savedRes.error.message}`);

      setEvents(eventsRes.data || []);
      setVendors(vendorsRes.data || []);
      setOrganizers(organizersRes.data || []);
      setApplications(appsRes.data || []);
      setSaved(savedRes.data || []);

      if (reviewsRes.error) {
        setReviewsAvailable(false);
        setReviews([]);
      } else {
        setReviews(reviewsRes.data || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const stats = useMemo(() => {
    const topStates: Record<string, number> = {};
    const topCategories: Record<string, number> = {};

    for (const event of events) {
      const state = String(event.state || "Unknown");
      const category = String(event.category || "Uncategorized");
      topStates[state] = (topStates[state] || 0) + 1;
      topCategories[category] = (topCategories[category] || 0) + 1;
    }

    const sortEntries = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return {
      totalEvents: events.length,
      totalVendors: vendors.length,
      totalOrganizers: organizers.length,
      totalApplications: applications.length,
      totalSaved: saved.length,
      totalReviews: reviews?.length || 0,
      accepting: events.filter((e) => e.accepting_vendors !== false).length,
      featured: events.filter((e) => e.is_featured).length,
      topStates: sortEntries(topStates),
      topCategories: sortEntries(topCategories),
    };
  }, [events, vendors, organizers, applications, saved, reviews]);

  if (loading) {
    return (
      <main className="adminPage">
        <p className="adminMuted">Loading analytics...</p>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Analytics</p>
        <h1>Marketplace intelligence</h1>
        <p className="adminMuted">Live counts from Supabase — no fake stats.</p>
      </section>

      <div className="adminStatsGrid">
        <div className="adminStatCard"><p>Events</p><strong>{stats.totalEvents}</strong></div>
        <div className="adminStatCard"><p>Vendors</p><strong>{stats.totalVendors}</strong></div>
        <div className="adminStatCard"><p>Organizers</p><strong>{stats.totalOrganizers}</strong></div>
        <div className="adminStatCard"><p>Applications</p><strong>{stats.totalApplications}</strong></div>
        <div className="adminStatCard"><p>Saved events</p><strong>{stats.totalSaved}</strong></div>
        <div className="adminStatCard">
          <p>Reviews</p>
          <strong>{reviewsAvailable ? stats.totalReviews : "N/A"}</strong>
        </div>
        <div className="adminStatCard"><p>Accepting vendors</p><strong>{stats.accepting}</strong></div>
        <div className="adminStatCard"><p>Featured events</p><strong>{stats.featured}</strong></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <section className="adminPanel">
          <h2>Top states</h2>
          {stats.topStates.length === 0 ? (
            <p className="adminMuted">No events yet.</p>
          ) : (
            <ul>
              {stats.topStates.map(([state, count]) => (
                <li key={state}>
                  {state}: <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adminPanel">
          <h2>Top categories</h2>
          {stats.topCategories.length === 0 ? (
            <p className="adminMuted">No categories yet.</p>
          ) : (
            <ul>
              {stats.topCategories.map(([category, count]) => (
                <li key={category}>
                  {category}: <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
