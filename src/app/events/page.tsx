"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import {
  formatEventDate,
  getBoothValue,
  getTrafficLabel,
  getVendorScore,
} from "@/lib/event-display";
import { EVENT_SEO_CATEGORIES } from "@/lib/categories";
import { US_STATES } from "@/lib/locations";
import { supabase } from "@/lib/supabase";

const quickFilters = [
  "Top Rated",
  "Under $100 Booth",
  "Food Vendors",
  "High Traffic",
  "Featured Events",
  "Verified Organizers",
  "Vendors Wanted",
];

const bestFitByCategory: Record<string, string[]> = {
  Festival: ["Food", "Coffee", "Crafts", "Wellness", "Local Retail"],
  "Farmers Market": ["Farm Products", "Coffee", "Bakery", "Wellness", "Handmade"],
  "Craft Fair": ["Jewelry", "Candles", "Art", "Handmade", "Home Decor"],
  "Flea Market": ["Vintage", "Collectibles", "Food", "Local Retail", "Resale"],
  "Food Truck Event": ["Food Trucks", "Coffee", "Desserts", "Beverages", "Snacks"],
  "Holiday Market": ["Gifts", "Candles", "Coffee", "Jewelry", "Handmade"],
  Expo: ["Services", "Wellness", "Retail", "Food", "Business Brands"],
  "Community Fair": ["Food", "Coffee", "Local Services", "Handmade", "Family Brands"],
  "Artisan Market": ["Handmade", "Art", "Jewelry", "Candles", "Wellness"],
};

function getBestFitBadges(event: any) {
  return bestFitByCategory[event?.category] || ["Coffee", "Food", "Handmade", "Wellness", "Local Retail"];
}

type OrganizerSummary = {
  user_id: string;
  slug?: string | null;
  organizer_name?: string | null;
};

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<any[]>([]);
  const [organizerByUserId, setOrganizerByUserId] = useState<
    Record<string, OrganizerSummary>
  >({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("All events");
  const [stateFilter, setStateFilter] = useState("All states");
  const [boothPrice, setBoothPrice] = useState("Any price");
  const [vendorRating, setVendorRating] = useState("Any rating");
  const [sortBy, setSortBy] = useState("Most Profitable");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [vendorsWantedOnly, setVendorsWantedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: adData } = await supabase
        .from("ad_orders")
        .select("*")
        .eq("payment_status", "paid")
        .eq("approval_status", "approved")
        .in("placement", ["events", "event_detail", "category_sponsor"])
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) alert(error.message);
      else {
        const rows = data || [];
        setEvents(rows);

        const creatorIds = [
          ...new Set(rows.map((row) => row.created_by).filter(Boolean)),
        ] as string[];

        if (creatorIds.length > 0) {
          const { data: organizers } = await supabase
            .from("organizer_profiles")
            .select("user_id, slug, organizer_name")
            .in("user_id", creatorIds);

          const map: Record<string, OrganizerSummary> = {};
          for (const org of organizers || []) {
            map[org.user_id] = org;
          }
          setOrganizerByUserId(map);
        }
      }

      setSponsoredAds(adData || []);
      setLoading(false);
    }

    loadEvents();
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const availableStates = useMemo(() => {
    const states = events
      .map((event) => event.state)
      .filter(Boolean)
      .map((state) => String(state).trim())
      .filter(Boolean);

    return ["All states", ...Array.from(new Set(states)).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    let results = events.filter((event) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        event.title?.toLowerCase().includes(searchText) ||
        event.city?.toLowerCase().includes(searchText) ||
        event.state?.toLowerCase().includes(searchText) ||
        event.zip_code?.toLowerCase().includes(searchText) ||
        event.category?.toLowerCase().includes(searchText) ||
        event.description?.toLowerCase().includes(searchText);

      const matchesType = eventType === "All events" || event.category === eventType;
      const matchesState = stateFilter === "All states" || event.state === stateFilter;

      const price = Number(event.booth_price || 0);

      const matchesPrice =
        boothPrice === "Any price" ||
        (boothPrice === "Free / TBD" && price === 0) ||
        (boothPrice === "Under $50" && price > 0 && price <= 50) ||
        (boothPrice === "Under $100" && price > 0 && price <= 100) ||
        (boothPrice === "Under $250" && price > 0 && price <= 250) ||
        (boothPrice === "$250+" && price >= 250);

      const rating = Number(event.rating || 0);

      const matchesRating =
        vendorRating === "Any rating" ||
        (vendorRating === "4.5 stars & up" && rating >= 4.5) ||
        (vendorRating === "4.8 stars & up" && rating >= 4.8) ||
        (vendorRating === "5 stars only" && rating >= 5);

      return (
        matchesSearch &&
        matchesType &&
        matchesState &&
        matchesPrice &&
        matchesRating &&
        (!featuredOnly || event.is_featured === true) &&
        (!verifiedOnly || event.verified_organizer === true) &&
        (!vendorsWantedOnly || event.accepting_vendors !== false)
      );
    });

    results = [...results].sort((a, b) => {
      if (sortBy === "Most Profitable") return getVendorScore(b) - getVendorScore(a);
      if (sortBy === "Highest Rated") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "Lowest Booth Fee") return Number(a.booth_price || 999999) - Number(b.booth_price || 999999);
      if (sortBy === "Highest Traffic") return Number(b.expected_visitors || 0) - Number(a.expected_visitors || 0);
      if (sortBy === "Recently Added") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === "Verified First") return Number(Boolean(b.verified_organizer)) - Number(Boolean(a.verified_organizer));
      if (sortBy === "Vendors Wanted First") return Number(b.accepting_vendors !== false) - Number(a.accepting_vendors !== false);
      return 0;
    });

    return results;
  }, [events, search, eventType, stateFilter, boothPrice, vendorRating, sortBy, verifiedOnly, vendorsWantedOnly, featuredOnly]);

  const featuredEvents = useMemo(() => {
    return events
      .filter((event) => event.is_featured)
      .sort((a, b) => getVendorScore(b) - getVendorScore(a))
      .slice(0, 3);
  }, [events]);

  function applyQuickFilter(filter: string) {
    if (filter === "Top Rated") setVendorRating("4.5 stars & up");
    if (filter === "Under $100 Booth") setBoothPrice("Under $100");
    if (filter === "Food Vendors") setEventType("Food Truck Event");
    if (filter === "High Traffic") setSortBy("Highest Traffic");
    if (filter === "Featured Events") setFeaturedOnly(true);
    if (filter === "Verified Organizers") setVerifiedOnly(true);
    if (filter === "Vendors Wanted") setVendorsWantedOnly(true);
  }

  async function goListEvent() {
    const { user } = await getAuthUser();
    window.location.href = user ? "/create-event" : "/login/organizer";
  }

  function clearFilters() {
    setSearch("");
    setEventType("All events");
    setStateFilter("All states");
    setBoothPrice("Any price");
    setVendorRating("Any rating");
    setSortBy("Most Profitable");
    setVerifiedOnly(false);
    setVendorsWantedOnly(false);
    setFeaturedOnly(false);
  }

  async function saveEvent(eventId: string) {
    const { user } = await getAuthUser();

    if (!user) {
      alert("Please login first to save events.");
      window.location.href = "/login/vendor";
      return;
    }

    const { error } = await supabase.from("saved_events").insert({
      vendor_id: user.id,
      event_id: eventId,
    });

    if (error) {
      alert(error.message.includes("duplicate") ? "You already saved this event." : error.message);
      return;
    }

    alert("Event saved to your dashboard.");
  }

  async function applyToEvent(eventId: string) {
    const { user } = await getAuthUser();

    if (!user) {
      alert("Please login first to apply as a vendor.");
      window.location.href = "/login/vendor";
      return;
    }

    const { error } = await supabase.from("event_attendance").insert({
      event_id: eventId,
      vendor_id: user.id,
      status: "requested",
    });

    if (error) {
      alert(error.message.includes("duplicate") ? "You already applied for this event." : error.message);
      return;
    }

    alert("Application request sent successfully.");
  }

  function renderSponsoredAd(index: number) {
    if (sponsoredAds.length === 0) return null;

    const ad = sponsoredAds[index % sponsoredAds.length];

    return (
      <article className="marketEventCard" key={`sponsored-${index}-${ad.id}`}>
        <div
          className="marketEventImage"
          style={{
            backgroundImage: `url(${
              ad.image_url ||
              "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
            })`,
          }}
        >
          <span>Sponsored Partner</span>
        </div>

        <div className="marketEventBody">
          <div className="eventDate">Premium Sponsored Placement</div>
          <h3>{ad.ad_title || "Featured VendorEventsHub Partner"}</h3>

          <p className="muted">
            {ad.ad_description || "A premium business promoted through VendorEventsHub."}
          </p>

          <div className="marketStats">
            <span>{ad.business_name || "Sponsored Business"}</span>
            <span>{ad.placement || "Premium Placement"}</span>
            <span>Paid Partner</span>
            <span>30-Day Feature</span>
          </div>

          {ad.link_url && (
            <div className="eventActions">
              <button className="fullBtn" onClick={() => window.open(ad.link_url, "_blank")}>
                Visit Website
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Vendor Event Intelligence</p>
          <h1>Find profitable vendor events before wasting money on the wrong booth.</h1>
          <p className="heroText">
            Compare booth fees, traffic, vendor ratings, organizer trust, and
            opportunity signals before you apply. VendorEventsHub helps vendors
            book smarter and organizers attract better businesses.
          </p>

          <div className="heroActions">
            <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
              Explore Events
            </button>
            <button className="outlineBtn" type="button" onClick={goListEvent}>
              List Your Event
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>Vendor Profit Scores</span>
            <span>Booth Fee Transparency</span>
            <span>Verified Organizer Signals</span>
            <span>Vendors Wanted Alerts</span>
          </div>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Marketplace Snapshot</p>
          <h3>Smarter event discovery for serious vendors.</h3>

          <div className="vhScoreCard">
            <div><strong>{events.length}</strong><span>Live events</span></div>
            <div><strong>{featuredEvents.length}</strong><span>Featured</span></div>
            <div><strong>{events.filter((event) => event.accepting_vendors !== false).length}</strong><span>Vendors wanted</span></div>
            <div><strong>{events.filter((event) => event.verified_organizer).length}</strong><span>Verified</span></div>
          </div>

          <button className="goldBtn fullWidth" onClick={() => (window.location.href = "/signup")}>
            Claim Founder Access
          </button>
        </div>
      </section>

      {featuredEvents.length > 0 && (
        <section className="luxSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Featured Opportunities</p>
              <h2>Premium events vendors should review first.</h2>
            </div>
            <button className="outlineBtn" onClick={() => setFeaturedOnly(true)}>
              View Featured Only
            </button>
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
                  <div className="eventDate">{formatEventDate(event.event_date)}</div>
                  <h3>{event.title}</h3>
                  <p className="muted">{event.city}, {event.state} {event.zip_code}</p>

                  <div className="pillGrid">
                    <span>Featured</span>
                    {event.verified_organizer && <span>Verified Organizer</span>}
                    {event.accepting_vendors !== false && <span>Vendors Wanted</span>}
                    <span>{getTrafficLabel(event)}</span>
                    <span>{getBoothValue(event)}</span>
                  </div>

                  <Link className="fullBtn eventDetailLink" href={`/events/${event.id}`}>
                    View Intelligence
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {sponsoredAds.length > 0 && (
        <section className="luxSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Sponsored Partners</p>
              <h2>Premium businesses helping vendors grow smarter.</h2>
            </div>
            <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
              Advertise Here
            </button>
          </div>
          <div className="eventsList">{sponsoredAds.slice(0, 2).map((_, i) => renderSponsoredAd(i))}</div>
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
            placeholder="Search city, ZIP, event name, category, organizer keywords..."
            value={search}
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

        <div className="stateBrowse">
          <p className="goldEyebrow">Vendor Events by State</p>
          <h3 className="vehSectionTitle">Browse vendor events by state</h3>
          <div className="stateLinkGrid">
            {US_STATES.map((state) => (
              <Link key={state.slug} href={`/events/${state.slug}`}>
                {state.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="stateBrowse">
          <p className="goldEyebrow">Vendor Events by Category</p>
          <h3 className="vehSectionTitle">Find opportunities by event type</h3>
          <div className="categorySeoGrid">
            {EVENT_SEO_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/events/category/${cat.slug}`}>
                {cat.headline}
              </Link>
            ))}
          </div>
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
                <option>Recently Added</option>
                <option>Verified First</option>
                <option>Vendors Wanted First</option>
              </select>
            </label>

            <label>
              State
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                {availableStates.map((state) => <option key={state}>{state}</option>)}
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
                <option>Free / TBD</option>
                <option>Under $50</option>
                <option>Under $100</option>
                <option>Under $250</option>
                <option>$250+</option>
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

            <label style={{ flexDirection: "row", alignItems: "center" }}>
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              Verified organizers only
            </label>

            <label style={{ flexDirection: "row", alignItems: "center" }}>
              <input type="checkbox" checked={vendorsWantedOnly} onChange={(e) => setVendorsWantedOnly(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              Vendors wanted only
            </label>

            <label style={{ flexDirection: "row", alignItems: "center" }}>
              <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} style={{ width: "18px", height: "18px" }} />
              Featured only
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
              <p>Sorted by vendor opportunity signals, booth value, trust, and traffic.</p>
            </div>

            {loading ? (
              <div className="premiumEmptyState">
                <p className="premiumEmptyEyebrow">Marketplace</p>
                <h3>Loading vendor opportunities...</h3>
                <p>Curating events, booth fees, and trust signals for your search.</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="emptyStateCard premiumEmptyState">
                <p className="premiumEmptyEyebrow">Search Results</p>
                <h3>No matching events found</h3>
                <p>Try another state, category, booth price, or trust filter.</p>
                <div className="premiumEmptyActions">
                  <button className="goldBtn" onClick={clearFilters}>Reset Search</button>
                  <button className="outlineBtn" type="button" onClick={goListEvent}>
                    List An Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="eventsList">
                {filteredEvents.map((event, index) => {
                  const vendorScore = getVendorScore(event);
                  const badges = getBestFitBadges(event);
                  const organizer = event.created_by
                    ? organizerByUserId[event.created_by]
                    : null;
                  const boothLabel =
                    event.booth_price != null && event.booth_price !== ""
                      ? `$${event.booth_price} Booth`
                      : "Booth Fee TBD";
                  const visitorsLabel = event.expected_visitors
                    ? `${event.expected_visitors} Visitors`
                    : "Visitors TBD";
                  const acceptingLabel =
                    event.accepting_vendors === false
                      ? "Applications Closed"
                      : "Accepting Vendors";

                  return (
                    <div key={event.id}>
                      {index > 0 && index % 6 === 0 && renderSponsoredAd(index)}

                      <article className="marketEventCard">
                        <div
                          className="marketEventImage"
                          style={{
                            backgroundImage: `url(${
                              event.image_url ||
                              "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                            })`,
                          }}
                        >
                          {event.is_featured && <span>Featured</span>}
                          {!event.is_featured && <span>{vendorScore}/100 Vendor Score</span>}
                        </div>

                        <div className="marketEventBody">
                          <div className="eventDate">{formatEventDate(event.event_date)}</div>
                          <h3>{event.title}</h3>
                          <p className="muted">
                            {event.city}, {event.state} {event.zip_code}
                          </p>

                          {organizer?.slug && (
                            <p className="muted organizerLine">
                              Organizer:{" "}
                              <Link href={`/organizers/${organizer.slug}`}>
                                {organizer.organizer_name || "View profile"}
                              </Link>
                            </p>
                          )}

                          <div className="marketStats">
                            <span>{vendorScore}/100 Vendor Score</span>
                            <span>{boothLabel}</span>
                            <span>{visitorsLabel}</span>
                            <span>{getTrafficLabel(event)}</span>
                            <span>{getBoothValue(event)}</span>
                            <span>{acceptingLabel}</span>
                            {event.is_featured && <span>Featured Event</span>}
                            {event.verified_organizer && <span>Verified Organizer</span>}
                          </div>

                          <div className="pillGrid">
                            {badges.map((badge) => (
                              <span key={badge}>Best for {badge}</span>
                            ))}
                          </div>

                          <div className="eventActions">
                            <Link className="fullBtn eventDetailLink" href={`/events/${event.id}`}>
                              View Details
                            </Link>
                            <button className="outlineBtn" type="button" onClick={() => saveEvent(event.id)}>
                              Save
                            </button>
                            <button className="outlineBtn" type="button" onClick={() => applyToEvent(event.id)}>
                              Apply
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
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
            build trust with verified vendor reviews.
          </p>

          <div className="heroActions">
            <button className="goldBtn" type="button" onClick={goListEvent}>
              List Your Event
            </button>
            <button className="outlineBtn" type="button" onClick={() => (window.location.href = "/advertise")}>
              Boost An Event
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}