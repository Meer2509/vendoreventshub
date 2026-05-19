"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  "Festivals",
  "Craft Fairs",
  "Flea Markets",
  "Farmers Markets",
  "Food Festivals",
  "Holiday Markets",
  "Expos",
  "Wellness Events",
];

const painPoints = [
  "Low foot traffic",
  "Hidden booth fees",
  "Poor organizer communication",
  "Wrong customer audience",
];

const trustStats = [
  ["Vendor Reviews", "Real event feedback"],
  ["Booth ROI", "Cost vs opportunity"],
  ["Traffic Signals", "Before you book"],
  ["Organizer Trust", "Know who runs it"],
];

const bestFitBadges = ["Coffee", "Food", "Handmade", "Wellness"];

function getVendorScore(event: any) {
  const booth = Number(event.booth_price || 0);
  const visitors = Number(event.expected_visitors || 0);
  const rating = Number(event.rating || 0);
  const featured = Boolean(event.is_featured);

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

function getTrafficLabel(event: any) {
  const visitors = Number(event.expected_visitors || 0);

  if (visitors >= 10000) return "Very High Traffic";
  if (visitors >= 5000) return "High Traffic";
  if (visitors >= 1000) return "Strong Local Traffic";
  if (visitors > 0) return "Local Opportunity";
  return "Traffic TBD";
}

function getBoothValue(event: any) {
  const booth = Number(event.booth_price || 0);

  if (!booth) return "Booth Fee TBD";
  if (booth <= 100) return "Excellent Booth Value";
  if (booth <= 250) return "Strong Booth Value";
  if (booth <= 500) return "Moderate Booth Value";
  return "Premium Booth Fee";
}

const fallbackEvents = [
  {
    id: "fallback-1",
    title: "Premium Vendor Event Listings Coming Soon",
    city: "Connecticut",
    state: "USA",
    zip_code: "",
    category: "Vendor Event",
    booth_price: 100,
    expected_visitors: 2500,
    rating: 4.8,
    is_featured: true,
    event_date: "New events being added",
    image_url:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop",
    fallback: true,
  },
  {
    id: "fallback-2",
    title: "List Your Festival, Fair, Market, or Expo",
    city: "Northeast",
    state: "USA",
    zip_code: "",
    category: "Organizer Opportunity",
    booth_price: 75,
    expected_visitors: 1500,
    rating: 4.7,
    is_featured: true,
    event_date: "Founder listings open now",
    image_url:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1400&auto=format&fit=crop",
    fallback: true,
  },
  {
    id: "fallback-3",
    title: "Founding Vendors Can Join Free",
    city: "America",
    state: "USA",
    zip_code: "",
    category: "Founding Access",
    booth_price: 0,
    expected_visitors: 1000,
    rating: 5,
    is_featured: true,
    event_date: "Limited access available",
    image_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
    fallback: true,
  },
];

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadHomepageData() {
      const now = new Date().toISOString();

      const { data: adData } = await supabase
        .from("ad_orders")
        .select("*")
        .eq("payment_status", "paid")
        .eq("approval_status", "approved")
        .eq("placement", "homepage")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      setAds(adData || []);
      setEvents(eventData || []);
    }

    loadHomepageData();
  }, []);

  const trendingEvents = useMemo(() => {
    const sourceEvents = events.length > 0 ? events : fallbackEvents;

    return [...sourceEvents]
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return getVendorScore(b) - getVendorScore(a);
      })
      .slice(0, 6);
  }, [events]);

  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">America’s Vendor Intelligence Platform</p>

          <h1>Never waste money on the wrong vendor event again.</h1>

          <p className="heroText">
            Discover profitable festivals, fairs, flea markets, farmers markets,
            craft shows, and pop-up events using real vendor reviews, booth fees,
            traffic insights, organizer reputation, and vendor experience data.
          </p>

          <div className="heroActions">
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/events")}
            >
              Find Events
            </button>

            <button
              className="outlineBtn"
              onClick={() => (window.location.href = "/create-event")}
            >
              List Your Event
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>Vendor Profit Scores</span>
            <span>Booth Fee Transparency</span>
            <span>Verified Vendor Reviews</span>
          </div>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Vendor Profit Check</p>
          <h3>Before you book a booth, know the real opportunity.</h3>

          <div className="vhScoreCard">
            {trustStats.map(([title, text]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button
            className="goldBtn fullWidth"
            onClick={() => (window.location.href = "/signup")}
          >
            Join Free
          </button>
        </div>
      </section>

      <section className="vhProblemSection">
        <p className="goldEyebrow">The Vendor Problem</p>
        <h2>One bad show can cost vendors hundreds of dollars.</h2>

        <div className="vhProblemGrid">
          {painPoints.map((item) => (
            <div className="vhProblemCard" key={item}>
              <span>✕</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Trending Vendor Events</p>
            <h2>
              {events.length > 0
                ? "Live opportunities vendors can compare before booking."
                : "Vendor opportunities are being added now."}
            </h2>
          </div>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/events")}
          >
            View All Events
          </button>
        </div>

        <div className="luxEventGrid">
          {trendingEvents.map((event) => (
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
                <div className="eventDate">
                  {event.event_date || "Date coming soon"}
                </div>

                <h3>{event.title}</h3>

                <p className="muted">
                  {event.city}, {event.state} {event.zip_code}
                </p>

                <div className="pillGrid">
                  <span>{getTrafficLabel(event)}</span>
                  <span>{getBoothValue(event)}</span>
                  <span>★ {event.rating || "New"}</span>
                  {event.is_featured && <span>Featured</span>}
                </div>

                <div className="pillGrid">
                  {bestFitBadges.map((badge) => (
                    <span key={badge}>Best for {badge}</span>
                  ))}
                </div>

                <button
                  className="fullBtn"
                  onClick={() =>
                    event.fallback
                      ? (window.location.href = "/events")
                      : (window.location.href = `/events/${event.id}`)
                  }
                >
                  {event.fallback ? "Explore Events" : "View Event Intelligence"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {ads.length > 0 && (
        <section className="liveAdsSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Sponsored Placements</p>
              <h2>Featured Sponsored Partners</h2>
            </div>

            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/advertise")}
            >
              Advertise Here
            </button>
          </div>

          <div className="liveAdsGrid">
            {ads.slice(0, 3).map((ad) => (
              <article className="liveAdCard" key={ad.id}>
                <div
                  className="liveAdImage"
                  style={{
                    backgroundImage: `url(${ad.image_url || "/window.svg"})`,
                  }}
                >
                  <span>Sponsored</span>
                </div>

                <div className="liveAdBody">
                  <p className="goldEyebrow">
                    {ad.business_name || "Sponsored Partner"}
                  </p>
                  <h3>{ad.ad_title || ad.title || "Premium Sponsored Ad"}</h3>
                  <p className="muted">
                    {ad.ad_description ||
                      ad.description ||
                      "A premium partner promoted through VendorEventsHub."}
                  </p>

                  {ad.link_url && (
                    <button
                      className="goldBtn fullWidth"
                      onClick={() => window.open(ad.link_url, "_blank")}
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">How It Works</p>
            <h2>Find better events before you spend money.</h2>
          </div>
        </div>

        <div className="featureGrid">
          <div className="featureBox">
            <span className="stepNumber">01</span>
            <h3>Search events</h3>
            <p>
              Browse festivals, fairs, flea markets, farmers markets, expos, and
              pop-ups by category and location.
            </p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">02</span>
            <h3>Compare the opportunity</h3>
            <p>
              Review booth fees, expected traffic, vendor fit, organizer quality,
              and profitability signals.
            </p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">03</span>
            <h3>Book smarter</h3>
            <p>
              Choose events with stronger vendor potential and avoid shows that
              waste time, money, and inventory.
            </p>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Browse By Category</p>
            <h2>Find the right event for your business.</h2>
          </div>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/events")}
          >
            View All Events
          </button>
        </div>

        <div className="categoryLuxuryGrid">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => (window.location.href = "/events")}
            >
              <span>{category}</span>
              <small>Explore opportunities</small>
            </button>
          ))}
        </div>
      </section>

      <section className="premiumCta">
        <p className="goldEyebrow">For Organizers & Brands</p>
        <h2>Reach vendors before they choose their next event.</h2>
        <p>
          Promote your festival, market, vendor service, food truck opportunity,
          booth equipment, or local business directly to event-ready vendors.
        </p>

        <div className="heroActions">
          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/advertise")}
          >
            Advertise Your Business
          </button>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/pricing")}
          >
            View Pricing
          </button>
        </div>
      </section>

      <section className="finalStartupCta">
        <p className="goldEyebrow">Start Growing Smarter</p>
        <h2>Build your vendor business with better event intelligence.</h2>

        <div className="heroActions">
          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/events")}
          >
            Explore Events
          </button>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/profile/setup")}
          >
            Create Vendor Profile
          </button>
        </div>
      </section>
    </main>
  );
}