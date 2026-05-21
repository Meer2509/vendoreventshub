"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  formatEventDate,
  getBoothValue,
  getTrafficLabel,
  getVendorScore,
} from "@/lib/event-display";
import {
  formatCityLabel,
  getStateBySlug,
  type StateInfo,
  eventMatchesCity,
  eventMatchesState,
  slugifyLocation,
} from "@/lib/locations";
import { supabase } from "@/lib/supabase";

type LocationEventsClientProps = {
  stateSlug: string;
  citySlug?: string;
};

export default function LocationEventsClient({
  stateSlug,
  citySlug,
}: LocationEventsClientProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const state = getStateBySlug(stateSlug);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      setEvents(data || []);
      setLoading(false);
    }

    load();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!state) return [];

    return (events || []).filter((event) => {
      if (!eventMatchesState(event.state, state)) return false;
      if (citySlug && !eventMatchesCity(event.city, citySlug)) return false;
      return true;
    });
  }, [events, state, citySlug]);

  const cityLabel = citySlug ? formatCityLabel(citySlug) : "";

  if (!state) {
    return (
      <main className="luxuryPage">
        <section className="luxSection">
          <PremiumEmptyState
            title="Location not found"
            description="Try browsing all vendor events or choose a state from the directory."
            actionLabel="Browse Events"
            onAction={() => (window.location.href = "/events")}
          />
        </section>
      </main>
    );
  }

  const heading = citySlug
    ? `Vendor Events in ${cityLabel}, ${state.abbr}`
    : `Vendor Events in ${state.name}`;

  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Vendor Events Near Me</p>
          <h1>{heading}</h1>
          <p className="heroText">
            Compare craft fairs, flea markets, farmers markets, festival vendor
            applications, and local booth opportunities in {citySlug ? cityLabel : state.name}.
            VendorEventsHub helps vendors review booth fees and traffic signals before applying.
          </p>
          <div className="heroActions">
            <Link href="/events" className="goldBtn">
              Browse All Events
            </Link>
            <Link href="/create-event" className="outlineBtn">
              List Your Event
            </Link>
            <Link href="/signup" className="outlineBtn">
              Join as Vendor
            </Link>
          </div>
        </div>
      </section>

      <section className="luxSection">
        {loading ? (
          <div className="premiumEmptyState">
            <p className="premiumEmptyEyebrow">Loading</p>
            <h3>Finding events in this area...</h3>
          </div>
        ) : filteredEvents.length === 0 ? (
          <PremiumEmptyState
            eyebrow="Local Marketplace"
            title={`Be the first organizer to list an event in this area`}
            description={`VendorEventsHub is expanding listings in ${citySlug ? `${cityLabel}, ${state.name}` : state.name}. Organizers can publish the first trusted event listing today.`}
            actionLabel="List Your Event"
            onAction={() => (window.location.href = "/create-event")}
            secondaryLabel="Join as Vendor"
            onSecondary={() => (window.location.href = "/signup")}
          />
        ) : (
          <div className="luxEventGrid">
            {filteredEvents.map((event) => (
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
                  <div className="eventDate">{formatEventDate(event.event_date)}</div>
                  <h3>{event.title}</h3>
                  <p className="muted">
                    {event.city}, {event.state}
                  </p>
                  <div className="pillGrid">
                    <span>${event.booth_price || "TBD"} booth</span>
                    <span>{event.expected_visitors || "TBD"} visitors</span>
                    <span>{getTrafficLabel(event)}</span>
                    <span>{getBoothValue(event)}</span>
                    {event.accepting_vendors !== false && <span>Accepting vendors</span>}
                  </div>
                  <Link href={`/events/${event.id}`} className="fullBtn">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!citySlug && filteredEvents.length > 0 && (
        <section className="luxSection">
          <div className="sectionHeader">
            <h2>Cities in {state.name}</h2>
          </div>
          <div className="pillGrid">
            {[...new Set(filteredEvents.map((e) => slugifyLocation(e.city)).filter(Boolean))].map(
              (city) => (
                <Link
                  key={city}
                  href={`/events/${state.slug}/${city}`}
                  className="outlineBtn"
                >
                  {formatCityLabel(city)}
                </Link>
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}
