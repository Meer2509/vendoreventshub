"use client";

import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import {
  eventMatchesCategory,
  getCategoryBySlug,
} from "@/lib/categories";
import {
  formatEventDate,
  getBoothValue,
  getTrafficLabel,
  getVendorScore,
} from "@/lib/event-display";
import { absoluteUrl } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

type Props = { categorySlug: string };

export default function CategoryEventsClient({ categorySlug }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const category = getCategoryBySlug(categorySlug);

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
    if (!category) return [];
    return (events || []).filter((event) =>
      eventMatchesCategory(event.category, category)
    );
  }, [events, category]);

  const structuredData = useMemo(() => {
    if (!category) return [];
    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Events",
            item: absoluteUrl("/events"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.headline,
            item: absoluteUrl(`/events/category/${category.slug}`),
          },
        ],
      },
    ];
  }, [category]);

  if (!category) {
    return (
      <main className="luxuryPage">
        <section className="luxSection">
          <PremiumEmptyState
            title="Category not found"
            description="Browse all vendor events or pick a category from the marketplace directory."
            actionLabel="Browse Events"
            onAction={() => (window.location.href = "/events")}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="luxuryPage">
      <JsonLd data={structuredData} />
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Vendor Events by Category</p>
          <h1 className="vehSectionTitle">{category.headline}</h1>
          <p className="vehBodyText">{category.description}</p>
          <div className="heroActions">
            <Link href="/events" className="goldBtn">
              Browse All Events
            </Link>
            <Link href="/signup" className="outlineBtn">
              Join as Vendor
            </Link>
            <Link href="/create-event" className="outlineBtn">
              List Your Event
            </Link>
          </div>
        </div>
      </section>

      <section className="luxSection">
        {loading ? (
          <PremiumEmptyState
            title="Loading opportunities..."
            description="Curating vendor events for this category."
          />
        ) : filteredEvents.length === 0 ? (
          <PremiumEmptyState
            eyebrow={category.title}
            title={`No ${category.title.toLowerCase()} listed yet`}
            description="Be the first organizer to list an event in this category, or join as a founding vendor to get notified when listings go live."
            actionLabel="List Your Event"
            onAction={() => (window.location.href = "/create-event")}
            secondaryLabel="Join as Vendor"
            onSecondary={() => (window.location.href = "/signup")}
          />
        ) : (
          <div className="luxEventGrid">
            {filteredEvents.map((event) => (
              <article className="luxEventCard" key={event.id}>
                <div className="eventBody">
                  <div className="eventDate">{formatEventDate(event.event_date)}</div>
                  <h3>{event.title}</h3>
                  <p className="muted">
                    {event.city}, {event.state}
                  </p>
                  <div className="pillGrid">
                    <span>{getVendorScore(event)}/100 Vendor Score</span>
                    <span>{getTrafficLabel(event)}</span>
                    <span>{getBoothValue(event)}</span>
                  </div>
                  <Link href={`/events/${event.id}`} className="fullBtn eventDetailLink">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
