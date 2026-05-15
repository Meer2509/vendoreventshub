"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const quickFilters = [
  "Top Rated",
  "Under $100 Booth",
  "Food Vendors",
  "High Traffic",
  "Featured Events",
];

const bestFitBadges = ["Coffee", "Food", "Handmade", "Wellness", "Local Retail"];

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

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("All events");
  const [boothPrice, setBoothPrice] = useState("Any price");
  const [vendorRating, setVendorRating] = useState("Any rating");
  const [sortBy, setSortBy] = useState("Most Profitable");

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let results = events.filter((event) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        event.title?.toLowerCase().includes(searchText) ||
        event.city?.toLowerCase().includes(searchText) ||
        event.state?.toLowerCase().includes(searchText) ||
        event.zip_code?.toLowerCase().includes(searchText) ||
        event.category?.toLowerCase().includes(searchText);

      const matchesType =
        eventType === "All events" || event.category === eventType;

      const price = Number(event.booth_price || 0);

      const matchesPrice =
        boothPrice === "Any price" ||
        (boothPrice === "Under $50" && price <= 50) ||
        (boothPrice === "Under $100" && price <= 100) ||
        (boothPrice === "Under $250" && price <= 250);

      const rating = Number(event.rating || 0);

      const matchesRating =
        vendorRating === "Any rating" ||
        (vendorRating === "4.5 stars & up" && rating >= 4.5) ||
        (vendorRating === "4.8 stars & up" && rating >= 4.8) ||
        (vendorRating === "5 stars only" && rating >= 5);

      const matchesFeatured =
        search !== "featured-events-only" || event.is_featured === true;

      return matchesSearch && matchesType && matchesPrice && matchesRating && matchesFeatured;
    });

    results = [...results].sort((a, b) => {
      if (sortBy === "Most Profitable") {
        return getVendorScore(b) - getVendorScore(a);
      }

      if (sortBy === "Highest Rated") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sortBy === "Lowest Booth Fee") {
        return Number(a.booth_price || 999999) - Number(b.booth_price || 999999);
      }

      if (sortBy === "Highest Traffic") {
        return Number(b.expected_visitors || 0) - Number(a.expected_visitors || 0);
      }

      return 0;
    });

    return results;
  }, [events, search, eventType, boothPrice, vendorRating, sortBy]);

  const featuredEvents = useMemo(() => {
    return events
      .filter((event) => event.is_featured)
      .slice(0, 3);
  }, [events]);

  function applyQuickFilter(filter: string) {
    if (filter === "Top Rated") setVendorRating("4.5 stars & up");
    if (filter === "Under $100 Booth") setBoothPrice("Under $100");
    if (filter === "Food Vendors") setEventType("Food Truck Event");
    if (filter === "High Traffic") setSortBy("Highest Traffic");
    if (filter === "Featured Events") setSearch("featured-events-only");
  }

  function clearFilters() {
    setSearch("");
    setEventType("All events");
    setBoothPrice("Any price");
    setVendorRating("Any rating");
    setSortBy("Most Profitable");
  }

  async function saveEvent(eventId: string) {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first to save events.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("saved_events").insert({
      vendor_id: userData.user.id,
      event_id: eventId,
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        alert("You already saved this event.");
      } else {
        alert(error.message);
      }
      return;
    }

    alert("Event saved to your dashboard.");
  }

  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Vendor Event Intelligence</p>

          <h1>Find profitable vendor events before wasting money on the wrong booth.</h1>

          <p className="heroText">
            Compare booth fees, traffic, vendor ratings, organizer trust, and
            event opportunity before you apply. VendorEventsHub helps vendors
            book smarter and organizers attract better businesses.
          </p>

          <div className="heroActions">
            <button className="goldBtn" onClick={() => (window.location.href = "/create-event")}>
              List Your Event
            </button>

            <button className="outlineBtn" onClick={() => (window.location.href = "/pricing")}>
              Founding Access
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>Vendor Profit Scores</span>
            <span>Booth Fee Transparency</span>
            <span>Verified Reviews</span>
          </div>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Marketplace Snapshot</p>
          <h3>Smarter event discovery for serious vendors.</h3>

          <div className="vhScoreCard">
            <div>
              <strong>{events.length}</strong>
              <span>Live events</span>
            </div>
            <div>
              <strong>{featuredEvents.length}</strong>
              <span>Featured events</span>
            </div>
            <div>
              <strong>80</strong>
              <span>Vendor spots</span>
            </div>
            <div>
              <strong>$49</strong>
              <span>Ads start</span>
            </div>
          </div>

          <button className="goldBtn fullWidth" onClick={() => (window.location.href = "/signup")}>
            Claim Vendor Founder Spot
          </button>
        </div>
      </section>

      {featuredEvents.length > 0 && (
        <section className="luxSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Trending Events</p>
              <h2>Featured vendor opportunities.</h2>
            </div>
          </div>

          <div className="luxEventGrid">
            {featuredEvents.map((event) => (
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
                    {event.city}, {event.state}
                  </p>

                  <div className="pillGrid">
                    <span>{getTrafficLabel(event)}</span>
                    <span>{getBoothValue(event)}</span>
                    <span>★ {event.rating || "New"}</span>
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
      )}

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Search Events</p>
            <h2>Discover vendor opportunities near you.</h2>
          </div>
        </div>

        <div className="luxSearch eventsSearch">
          <input
            placeholder="Search city, ZIP, event name, category, or state..."
            value={search === "featured-events-only" ? "" : search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search Events</button>
        </div>

        <div className="filterRow">
          {quickFilters.map((filter) => (
            <button key={filter} onClick={() => applyQuickFilter(filter)}>
              {filter}
            </button>
          ))}
          <button onClick={clearFilters}>Clear Filters</button>
        </div>

        <div className="marketplaceLayout">
          <aside className="filterPanel">
            <h3>Smart Vendor Filters</h3>

            <label>
              Sort By
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Most Profitable</option>
                <option>Highest Rated</option>
                <option>Lowest Booth Fee</option>
                <option>Highest Traffic</option>
                <option>Newest Events</option>
              </select>
            </label>

            <label>
              Event Type
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option>All events</option>
                <option>Festival</option>
                <option>Farmers Market</option>
                <option>Craft Fair</option>
                <option>Flea Market</option>
                <option>Food Truck Event</option>
                <option>Holiday Market</option>
                <option>Expo</option>
                <option>Community Fair</option>
                <option>Artisan Market</option>
              </select>
            </label>

            <label>
              Booth Price
              <select value={boothPrice} onChange={(e) => setBoothPrice(e.target.value)}>
                <option>Any price</option>
                <option>Under $50</option>
                <option>Under $100</option>
                <option>Under $250</option>
              </select>
            </label>

            <label>
              Vendor Rating
              <select value={vendorRating} onChange={(e) => setVendorRating(e.target.value)}>
                <option>Any rating</option>
                <option>4.5 stars & up</option>
                <option>4.8 stars & up</option>
                <option>5 stars only</option>
              </select>
            </label>

            <div className="sidebarCard sponsorCard">
              <p>Sponsored Placement</p>
              <h3>Put your event at the top.</h3>
              <button className="outlineBtn fullWidth" onClick={() => (window.location.href = "/advertise")}>
                Advertise
              </button>
            </div>
          </aside>

          <div className="eventsResults">
            <div className="resultsTop">
              <h3>{filteredEvents.length} vendor opportunities</h3>
              <p>Sorted by real vendor opportunity signals.</p>
            </div>

            {loading ? (
              <p className="muted">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <div className="emptyStateCard">
                <h3>No matching events found.</h3>
                <p>Try another location, category, booth price, or rating filter.</p>
                <button className="goldBtn" onClick={clearFilters}>Reset Search</button>
              </div>
            ) : (
              <div className="eventsList">
                {filteredEvents.map((event) => {
                  const vendorScore = getVendorScore(event);

                  return (
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
                        <span>{vendorScore}/100 Vendor Score</span>
                      </div>

                      <div className="marketEventBody">
                        <div className="eventDate">{event.event_date || "Date coming soon"}</div>
                        <h3>{event.title}</h3>

                        <p className="muted">
                          {event.city}, {event.state} {event.zip_code}
                        </p>

                        <div className="marketStats">
                          <span>★ {event.rating || "New"} Rating</span>
                          <span>${event.booth_price || "TBD"} Booth</span>
                          <span>{event.expected_visitors || "TBD"} Visitors</span>
                          <span>{getTrafficLabel(event)}</span>
                          <span>{getBoothValue(event)}</span>
                          {event.is_featured && <span>Featured Event</span>}
                        </div>

                        <div className="pillGrid">
                          {bestFitBadges.map((badge) => (
                            <span key={badge}>Best for {badge}</span>
                          ))}
                        </div>

                        <div className="eventActions">
                          <button
                            className="fullBtn"
                            onClick={() => (window.location.href = `/events/${event.id}`)}
                          >
                            View Event Intelligence
                          </button>

                          <button className="outlineBtn" onClick={() => saveEvent(event.id)}>
                            Save
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="premiumCta">
          <p className="goldEyebrow">For Event Organizers</p>
          <h2>Bring quality vendors to your next festival, fair, or market.</h2>
          <p>
            List your event, collect vendor applications, approve attendance, and
            build trust with verified vendor reviews. First 50 organizers receive
            founding access free forever.
          </p>

          <div className="heroActions">
            <button className="goldBtn" onClick={() => (window.location.href = "/create-event")}>
              List Your Event
            </button>

            <button className="outlineBtn" onClick={() => (window.location.href = "/pricing")}>
              View Founding Offer
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}