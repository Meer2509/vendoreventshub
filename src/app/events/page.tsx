"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const quickFilters = [
  "Top Rated",
  "Under $100 Booth",
  "Food Vendors",
  "This Weekend",
  "High Traffic",
];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("All events");
  const [boothPrice, setBoothPrice] = useState("Any price");
  const [vendorRating, setVendorRating] = useState("Any rating");

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
    return events.filter((event) => {
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

      return matchesSearch && matchesType && matchesPrice && matchesRating;
    });
  }, [events, search, eventType, boothPrice, vendorRating]);

  function applyQuickFilter(filter: string) {
    if (filter === "Top Rated") {
      setVendorRating("4.5 stars & up");
    }

    if (filter === "Under $100 Booth") {
      setBoothPrice("Under $100");
    }

    if (filter === "Food Vendors") {
      setEventType("Food Truck Event");
    }

    if (filter === "High Traffic") {
      setSearch("visitors");
    }

    if (filter === "This Weekend") {
      alert("Weekend date filtering will be added next.");
    }
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

  function clearFilters() {
    setSearch("");
    setEventType("All events");
    setBoothPrice("Any price");
    setVendorRating("Any rating");
  }

  return (
    <main className="luxuryPage">
      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <div className="goldEyebrow">Explore Events</div>
            <h2>Find vendor events near you.</h2>
            <p className="muted">
              Search festivals, fairs, markets, expos, flea markets, food truck
              events, and premium vendor opportunities.
            </p>
          </div>

          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/create-event")}
          >
            List Your Event
          </button>
        </div>

        <div className="luxSearch eventsSearch">
          <input
            placeholder="Search by ZIP code, city, state, event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
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
            <h3>Filters</h3>

            <label>
              Event Type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
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
              <select
                value={boothPrice}
                onChange={(e) => setBoothPrice(e.target.value)}
              >
                <option>Any price</option>
                <option>Under $50</option>
                <option>Under $100</option>
                <option>Under $250</option>
              </select>
            </label>

            <label>
              Vendor Rating
              <select
                value={vendorRating}
                onChange={(e) => setVendorRating(e.target.value)}
              >
                <option>Any rating</option>
                <option>4.5 stars & up</option>
                <option>4.8 stars & up</option>
                <option>5 stars only</option>
              </select>
            </label>
          </aside>

          <div className="eventsResults">
            <div className="resultsTop">
              <h3>{filteredEvents.length} live event listings</h3>
              <p>Showing real events submitted by organizers.</p>
            </div>

            {loading ? (
              <p className="muted">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <p className="muted">No matching events found.</p>
            ) : (
              <div className="eventsList">
                {filteredEvents.map((event) => (
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
                      <span>{event.category || "Vendor Event"}</span>
                    </div>

                    <div className="marketEventBody">
                      <div className="eventDate">
                        {event.event_date || "Date coming soon"}
                      </div>

                      <h3>{event.title}</h3>

                      <p className="muted">
                        {event.city}, {event.state} {event.zip_code}
                      </p>

                      <div className="marketStats">
                        <span>★ {event.rating || "New"}</span>
                        <span>${event.booth_price || "TBD"} booth</span>
                        <span>{event.expected_visitors || "TBD"} visitors</span>
                        <span>Verified listing</span>
                      </div>

                      <div className="eventActions">
                        <button
                          className="fullBtn"
                          onClick={() =>
                            (window.location.href = `/events/${event.id}`)
                          }
                        >
                          View Details
                        </button>

                        <button
                          className="outlineBtn"
                          onClick={() => saveEvent(event.id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}