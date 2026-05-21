"use client";

import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { absoluteUrl } from "@/lib/seo";
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
  "Pop-Ups",
  "Trade Shows",
  "Car Shows",
  "Pet Events",
];

const painPoints = [
  "Low foot traffic",
  "Hidden booth fees",
  "Poor organizer communication",
  "Wrong customer audience",
  "No real vendor feedback",
  "Unclear booth ROI",
];

const solutions = [
  "Real vendor reviews",
  "Booth fee transparency",
  "Traffic signals",
  "Organizer reputation",
  "Best-fit categories",
  "Profitability insights",
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

const founderCards = [
  {
    id: "founder-1",
    title: "Coming Soon: Live Event Listings",
    city: "Connecticut",
    state: "CT",
    category: "Founder Access",
    booth_price: null,
    expected_visitors: null,
    is_featured: false,
    event_date: "Listings launching now",
    image_url:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop",
    founder: true,
    cta: "/signup",
    ctaLabel: "Join as Founding Vendor",
  },
  {
    id: "founder-2",
    title: "Founding Organizers: List Your First Event",
    city: "Connecticut",
    state: "CT",
    category: "Organizer Opportunity",
    booth_price: null,
    expected_visitors: null,
    is_featured: false,
    event_date: "Founder listings open",
    image_url:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1400&auto=format&fit=crop",
    founder: true,
    cta: "/create-event",
    ctaLabel: "List Your Event",
  },
  {
    id: "founder-3",
    title: "Vendor Intelligence, Not Just Event Listings",
    city: "Nationwide",
    state: "USA",
    category: "Platform Launch",
    booth_price: null,
    expected_visitors: null,
    is_featured: false,
    event_date: "Expanding state by state",
    image_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
    founder: true,
    cta: "/events",
    ctaLabel: "Explore Events",
  },
];

const fallbackAds = [
  {
    id: "ad-fallback-1",
    business_name: "Promote Your Festival",
    ad_title: "Get discovered by event-ready vendors.",
    ad_description:
      "Feature your fair, festival, flea market, farmers market, expo, or pop-up directly in front of vendors.",
    image_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
    link_url: "/advertise",
    fallback: true,
  },
  {
    id: "ad-fallback-2",
    business_name: "Vendor Services",
    ad_title: "Advertise to small businesses and local vendors.",
    ad_description:
      "Perfect for insurance, tents, signage, POS systems, packaging, marketing services, and booth suppliers.",
    image_url:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop",
    link_url: "/advertise",
    fallback: true,
  },
  {
    id: "ad-fallback-3",
    business_name: "Premium Placement",
    ad_title: "Homepage sponsored spotlight available.",
    ad_description:
      "Launch your brand in front of vendors, organizers, and event businesses across the platform.",
    image_url:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop",
    link_url: "/advertise",
    fallback: true,
  },
];

export default function HomePageClient() {
  const [ads, setAds] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  async function trackAd(ad: any, eventType: "view" | "click") {
    if (ad.fallback) return;

    try {
      let visitorId = localStorage.getItem("veh_visitor_id");

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("veh_visitor_id", visitorId);
      }

      await fetch("/api/track-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: ad.id,
          event_type: eventType,
          placement: "homepage",
          page_url: window.location.href,
          visitor_id: visitorId,
        }),
      });
    } catch {}
  }

  function goToEventsSearch() {
    const q = searchQuery.trim();
    window.location.href = q ? `/events?search=${encodeURIComponent(q)}` : "/events";
  }

  const trendingEvents = useMemo(() => {
    const sourceEvents = events.length > 0 ? events : founderCards;

    return [...sourceEvents]
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return getVendorScore(b) - getVendorScore(a);
      })
      .slice(0, 6);
  }, [events]);

  const displayAds = ads.length > 0 ? ads : fallbackAds;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VendorEventsHub",
    url: absoluteUrl("/"),
    description:
      "Vendor intelligence platform helping vendors compare events before applying.",
    areaServed: "United States",
  };

  return (
    <main className="vehPage">
      <JsonLd data={organizationJsonLd} />
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">America’s Vendor Intelligence Platform</p>
          <h1 className="vehHeroTitle">
            Find Vendor Events Worth Your Time &amp; Money
          </h1>
          <p className="heroText vehBodyText">
            Compare festivals, fairs, flea markets, craft shows, expos, and
            farmers markets before you apply. Vendor reviews, booth fees, traffic
            signals, and organizer trust — all in one place.
          </p>

          <form
            className="heroSearch"
            onSubmit={(e) => {
              e.preventDefault();
              goToEventsSearch();
            }}
          >
            <input
              type="search"
              placeholder="Search city, state, event type, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search vendor events"
            />
            <button type="submit">Search Events</button>
          </form>

          <div className="actions">
            <Link href="/events" className="btn btn-primary">
              Find Events
            </Link>
            <Link href="/create-event" className="btn btn-secondary">
              List Your Event
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              Join as Vendor
            </Link>
          </div>

          <div className="launchStrip">
            <span>Launching in Connecticut — expanding nationwide</span>
            <span>Founding vendors welcome</span>
            <span>Founding organizers can list events</span>
          </div>

          <div className="trustStrip">
            <span>Vendor Profit Scores</span>
            <span>Booth Fee Transparency</span>
            <span>Organizer Trust Signals</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Vendor Profit Check</p>
          <h3>Before you book a booth, know the real opportunity.</h3>

          <div className="scoreCircle">VE</div>

          <div className="miniGrid">
            <div>
              <strong>Traffic</strong>
              <span>Strong</span>
            </div>
            <div>
              <strong>Booth Value</strong>
              <span>Excellent</span>
            </div>
            <div>
              <strong>Best For</strong>
              <span>Coffee</span>
            </div>
            <div>
              <strong>Organizer</strong>
              <span>Trusted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="adSection">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Sponsored Spotlight</p>
            <h2>Premium ads below the hero.</h2>
          </div>
          <button onClick={() => (window.location.href = "/advertise")}>
            Advertise Here
          </button>
        </div>

        <div className="adRail">
          {displayAds.map((ad) => (
            <article
              className="adCard"
              key={ad.id}
              onMouseEnter={() => trackAd(ad, "view")}
            >
              <div
                className="adImage"
                style={{
                  backgroundImage: `url(${
                    ad.image_url ||
                    "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
                  })`,
                }}
              >
                <span>Sponsored</span>
              </div>
              <div className="adBody">
                <p>{ad.business_name || "Sponsored Partner"}</p>
                <h3>{ad.ad_title || "Premium Sponsored Placement"}</h3>
                <small>
                  {ad.ad_description ||
                    "A premium partner promoted through VendorEventsHub."}
                </small>
                <button
                  onClick={() => {
                    trackAd(ad, "click");
                    window.location.href = ad.link_url || "/advertise";
                  }}
                >
                  Learn More
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="problem">
        <p className="eyebrow">The Vendor Problem</p>
        <h2>One bad event can cost vendors hundreds of dollars.</h2>
        <div className="grid">
          {painPoints.map((item) => (
            <div className="problemCard" key={item}>
              <span>✕</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="solution">
        <p className="eyebrow">The Solution</p>
        <h2>VendorEventsHub helps vendors book smarter.</h2>
        <div className="grid">
          {solutions.map((item) => (
            <div className="solutionCard" key={item}>
              <span>✓</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="difference">
        <div className="sectionHead">
          <p className="eyebrow">Why VendorEventsHub Is Different</p>
          <h2>Event discovery vs vendor intelligence.</h2>
        </div>
        <div className="differenceGrid">
          <article className="differenceCard mutedCard">
            <h3>Typical event discovery</h3>
            <ul>
              <li>Scattered Facebook posts and outdated websites</li>
              <li>Hidden booth fees discovered too late</li>
              <li>Little visibility into traffic or organizer quality</li>
              <li>Hard to compare opportunities side-by-side</li>
            </ul>
          </article>
          <article className="differenceCard highlightCard">
            <h3>VendorEventsHub intelligence</h3>
            <ul>
              <li>Structured event listings with booth fee transparency</li>
              <li>Vendor Score™ signals and traffic indicators</li>
              <li>Organizer profiles and optional social proof</li>
              <li>Save, apply, and track opportunities in one marketplace</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="eventsSection">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Trending Vendor Opportunities</p>
            <h2>
              {events.length > 0
                ? "Live opportunities vendors can compare before booking."
                : "Vendor opportunities are being added now."}
            </h2>
          </div>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/events")}
          >
            View All Events
          </button>
        </div>

        <div className="eventGrid">
          {trendingEvents.map((event) => (
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
                <p>{event.event_date || "Date coming soon"}</p>
                <h3>{event.title}</h3>
                <small>
                  {event.city}, {event.state}
                </small>

                <div className="pills">
                  <span>{getTrafficLabel(event)}</span>
                  <span>{getBoothValue(event)}</span>
                  {!event.founder && (
                    <span>Vendor Score {getVendorScore(event)}/100</span>
                  )}
                </div>

                <div className="pills">
                  {bestFitBadges.map((badge) => (
                    <span key={badge}>Best for {badge}</span>
                  ))}
                </div>

                {event.founder ? (
                  <Link href={event.cta || "/signup"} className="btn btn-primary btn-block">
                    {event.ctaLabel || "Learn More"}
                  </Link>
                ) : (
                  <Link href={`/events/${event.id}`} className="btn btn-primary btn-block">
                    View Event Intelligence
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scoreSection">
        <p className="eyebrow">Vendor Score™</p>
        <h2>The Vendor Score™ makes event research simple.</h2>
        <p>
          Vendor Score combines booth value, vendor reviews, expected traffic,
          organizer trust, audience fit, and return-vendor interest.
        </p>

        <div className="scoreGrid">
          {[
            "Profit Potential",
            "Traffic Quality",
            "Booth Value",
            "Organizer Trust",
            "Audience Fit",
          ].map((item) => (
            <div key={item}>
              <strong>{item}</strong>
              <span>Measured before vendors book.</span>
            </div>
          ))}
        </div>
      </section>

      <section className="how">
        <p className="eyebrow">How It Works</p>
        <h2>Find better events before you spend money.</h2>

        <div className="howGrid">
          <div>
            <span>01</span>
            <h3>Search events</h3>
            <p>
              Browse festivals, fairs, flea markets, farmers markets, expos, and
              pop-ups by category and location.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Compare opportunity</h3>
            <p>
              Review booth fees, traffic, vendor fit, organizer quality, and
              profitability signals.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>Book smarter</h3>
            <p>
              Choose stronger events and avoid shows that waste time, money, and
              inventory.
            </p>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">Browse By Category</p>
            <h2>Find the right event for your business.</h2>
          </div>
        </div>

        <div className="categoryGrid">
          {categories.map((category) => {
            const slugMap: Record<string, string> = {
              "Craft Fairs": "craft-fairs",
              "Flea Markets": "flea-markets",
              "Farmers Markets": "farmers-markets",
              "Food Festivals": "food-festivals",
              Festivals: "festivals",
            };
            const href = slugMap[category]
              ? `/events/category/${slugMap[category]}`
              : "/events";

            return (
              <Link key={category} href={href} className="categoryGridLink">
                <span>{category}</span>
                <small>Explore opportunities</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="luxSection trustSections">
        <div className="trustGridHome">
          <article className="trustCardHome highlight">
            <p className="eyebrow">Why vendors trust VendorEventsHub</p>
            <h3>Vendor intelligence before you pay booth fees</h3>
            <ul>
              <li>Compare before paying booth fees</li>
              <li>Real vendor reviews when available</li>
              <li>Organizer transparency</li>
              <li>Traffic signals</li>
              <li>Vendor Score™</li>
              <li>No more guessing</li>
            </ul>
          </article>
          <article className="trustCardHome">
            <p className="eyebrow">Why organizers list on VendorEventsHub</p>
            <h3>Reach qualified, event-ready vendors</h3>
            <ul>
              <li>Get discovered by qualified vendors</li>
              <li>Build trust with organizer profiles</li>
              <li>Promote events</li>
              <li>Manage applications</li>
              <li>Fill booths faster</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="organizers">
        <p className="eyebrow">For Organizers</p>
        <h2>Fill your event with better vendors.</h2>
        <p>
          Promote your festival, market, fair, expo, or pop-up to vendors
          actively looking for opportunities.
        </p>

        <div className="actions center">
          <button onClick={() => (window.location.href = "/create-event")}>
            List Your Event
          </button>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/pricing")}
          >
            View Pricing
          </button>
        </div>
      </section>

      <section className="founding">
        <p className="eyebrow">Founding Access</p>
        <h2>Founding access is open.</h2>

        <div className="foundingGrid">
          <div>
            <h3>For Vendors</h3>
            <p>Join free, save events, review events, and find profitable opportunities.</p>
            <button onClick={() => (window.location.href = "/signup")}>
              Join as Vendor
            </button>
          </div>
          <div>
            <h3>For Organizers</h3>
            <p>First founding organizers can list events, attract vendors, and build trust early.</p>
            <button onClick={() => (window.location.href = "/create-event")}>
              Join as Organizer
            </button>
          </div>
        </div>
      </section>

      <section className="seo">
        <p className="eyebrow">Launching In Connecticut, Expanding Nationwide</p>
        <h2>Vendor events near me, craft fairs looking for vendors, flea market vendor opportunities, farmers market vendor registration, and festival vendor applications — all in one trusted platform.</h2>
      </section>

      <section className="finalCta">
        <p className="eyebrow">Stop Guessing</p>
        <h2>Start booking smarter.</h2>
        <p>
          Join the platform built to help vendors find better events and
          organizers attract better vendors.
        </p>

        <div className="actions center">
          <button onClick={() => (window.location.href = "/events")}>
            Find Events
          </button>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/signup")}
          >
            Create Free Account
          </button>
        </div>
      </section>

      <style jsx>{`
        .vehPage {
          background: #f7f1e6;
          color: #10291f;
          overflow: hidden;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 80px 18px;
        }

        .hero {
          min-height: 86vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 36px;
        }

        .eyebrow {
          color: #b88a2e;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 12px;
          margin-bottom: 14px;
        }

        h1 {
          font-size: clamp(48px, 8vw, 92px);
          line-height: 0.9;
          letter-spacing: -0.07em;
          margin: 0;
        }

        h2 {
          font-size: clamp(36px, 5vw, 64px);
          line-height: 0.95;
          letter-spacing: -0.06em;
          margin: 0;
        }

        h3 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .heroText,
        .scoreSection p,
        .organizers p,
        .finalCta p {
          font-size: 18px;
          line-height: 1.75;
          color: #5f6b66;
          max-width: 720px;
          margin-top: 22px;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(16, 41, 31, 0.18);
        }

        button.secondary {
          background: transparent;
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .center {
          justify-content: center;
        }

        .heroSearch {
          display: flex;
          gap: 10px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .heroSearch input {
          flex: 1;
          min-width: 220px;
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 14px 20px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.85);
        }

        .launchStrip {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 22px;
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(184, 138, 46, 0.12);
          border: 1px solid #cdbf9f;
        }

        .launchStrip span {
          font-size: 14px;
          font-weight: 800;
          color: #10291f;
        }

        .heroLinkBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: #10291f;
          color: white;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 900;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .heroLinkBtn.secondary {
          background: transparent;
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .heroLinkBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(16, 41, 31, 0.18);
        }

        .differenceGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .differenceCard {
          padding: 28px;
          border-radius: 28px;
          border: 1px solid #eadfc9;
          background: white;
          text-align: left;
        }

        .differenceCard ul {
          margin: 16px 0 0;
          padding-left: 20px;
          color: #5f6b66;
          line-height: 1.7;
        }

        .highlightCard {
          background: #f7f1e6;
          border-color: #b88a2e;
        }

        .eventCardLink {
          display: block;
          width: 100%;
          margin-top: 10px;
          text-align: center;
          border: 0;
          background: #10291f;
          color: white;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 900;
          text-decoration: none;
        }

        .trustStrip {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }

        .trustStrip span,
        .pills span {
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.65);
        }

        .heroPanel,
        .adCard,
        .problemCard,
        .solutionCard,
        .eventCard,
        .scoreSection,
        .howGrid div,
        .organizers,
        .founding,
        .seo,
        .finalCta {
          background: white;
          border: 1px solid #eadfc9;
          border-radius: 34px;
          box-shadow: 0 28px 80px rgba(20, 88, 63, 0.12);
        }

        .heroPanel {
          padding: 34px;
        }

        .panelBadge {
          display: inline-flex;
          background: #10291f;
          color: white;
          padding: 8px 13px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
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

        .miniGrid,
        .scoreGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .miniGrid div,
        .scoreGrid div {
          background: #f7f1e6;
          border-radius: 20px;
          padding: 16px;
        }

        .miniGrid span,
        .scoreGrid span {
          display: block;
          color: #5f6b66;
          margin-top: 4px;
          font-size: 14px;
        }

        .sectionHead {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 18px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .adRail {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(310px, 1fr);
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 12px;
        }

        .adCard {
          overflow: hidden;
          scroll-snap-align: start;
        }

        .adImage,
        .eventImage {
          min-height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .adImage span,
        .eventImage span {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
        }

        .adBody,
        .eventBody {
          padding: 24px;
        }

        .adBody p,
        .eventBody p {
          color: #b88a2e;
          font-weight: 900;
          margin: 0 0 8px;
          text-transform: uppercase;
          font-size: 12px;
        }

        .adBody small,
        .eventBody small {
          display: block;
          color: #5f6b66;
          line-height: 1.6;
          margin: 10px 0 18px;
        }

        .grid,
        .eventGrid,
        .howGrid,
        .categoryGrid,
        .foundingGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 28px;
        }

        .problemCard,
        .solutionCard,
        .howGrid div,
        .foundingGrid div {
          padding: 26px;
        }

        .problemCard span {
          color: #b33a2b;
          font-size: 24px;
          font-weight: 1000;
        }

        .solutionCard span {
          color: #17804f;
          font-size: 24px;
          font-weight: 1000;
        }

        .eventCard {
          overflow: hidden;
        }

        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 14px 0;
        }

        .eventBody button,
        .adBody button,
        .foundingGrid button {
          width: 100%;
          margin-top: 10px;
        }

        .scoreSection,
        .organizers,
        .founding,
        .seo,
        .finalCta {
          text-align: center;
          padding: 70px 28px;
        }

        .scoreGrid {
          grid-template-columns: repeat(5, 1fr);
          margin-top: 28px;
        }

        .howGrid span {
          color: #b88a2e;
          font-size: 32px;
          font-weight: 1000;
        }

        .howGrid p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .categoryGrid button,
        .categoryGridLink {
          display: block;
          background: white;
          color: #10291f;
          border: 1px solid #eadfc9;
          border-radius: 24px;
          padding: 24px;
          text-align: left;
          box-shadow: 0 16px 40px rgba(20, 88, 63, 0.08);
          text-decoration: none;
        }

        .categoryGrid span {
          display: block;
          font-size: 20px;
          font-weight: 1000;
        }

        .categoryGrid small {
          color: #5f6b66;
          margin-top: 6px;
          display: block;
        }

        .foundingGrid div {
          background: #f7f1e6;
          border-radius: 26px;
          text-align: left;
        }

        .foundingGrid p {
          color: #5f6b66;
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            padding-top: 44px;
            min-height: auto;
          }

          .grid,
          .eventGrid,
          .howGrid,
          .categoryGrid,
          .foundingGrid,
          .scoreGrid,
          .differenceGrid {
            grid-template-columns: 1fr;
          }

          .miniGrid {
            grid-template-columns: 1fr;
          }

          section {
            padding: 54px 16px;
          }

          .adRail {
            grid-auto-columns: 86%;
          }

          h1 {
            font-size: 52px;
          }
        }
      `}</style>
    </main>
  );
}