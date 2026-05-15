"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);

  const events = [
    {
      title: "Litchfield Spring Market",
      location: "Litchfield, CT",
      date: "May 18, 2026",
      visitors: "8,500+ Visitors",
      rating: "4.9 Vendor Rating",
      booth: "$75 Booth Fee",
    },
    {
      title: "New England Craft Expo",
      location: "Hartford, CT",
      date: "June 7, 2026",
      visitors: "15,000+ Visitors",
      rating: "4.8 Vendor Rating",
      booth: "$140 Booth Fee",
    },
    {
      title: "Morris Farmers Market",
      location: "Morris, CT",
      date: "Every Saturday",
      visitors: "Local Premium Traffic",
      rating: "5.0 Vendor Rating",
      booth: "$40 Booth Fee",
    },
  ];

  useEffect(() => {
    async function loadAds() {
      const { data } = await supabase
        .from("sponsored_ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setAds(data || []);
    }

    loadAds();
  }, []);

  return (
    <main className="luxuryPage">
      {/* NAVBAR */}
      <nav className="luxNav">
        <div
          className="luxBrand"
          onClick={() => (window.location.href = "/")}
        >
          VendorEventsHub
        </div>

        <div className="luxLinks">
          <a onClick={() => (window.location.href = "/events")}>
            Events
          </a>

          <a onClick={() => (window.location.href = "/vendors")}>
            Vendors
          </a>

          <a onClick={() => (window.location.href = "/manage-events")}>
            Organizers
          </a>

          <a onClick={() => (window.location.href = "/advertise")}>
            Premium Ads
          </a>

          <a onClick={() => (window.location.href = "/pricing")}>
            Pricing
          </a>
        </div>

        <div className="luxActions">
          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </button>

          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/create-event")}
          >
            List Your Event
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="luxHero">
        <div>
          <div className="goldEyebrow">
            America’s Premium Vendor Event Platform
          </div>

          <h1>
            Discover luxury festivals, fairs & profitable vendor events.
          </h1>

          <p className="heroText">
            Find the best events before booking your booth. Compare vendor
            ratings, traffic, pricing, sales potential, reviews, and real
            vendor experiences across America.
          </p>

          <div className="luxSearch">
            <input placeholder="Search by city, ZIP code, event, market..." />

            <button
              onClick={() => (window.location.href = "/events")}
            >
              Search Events
            </button>
          </div>

          <div className="trustRow">
            <span>Verified Vendor Reviews</span>
            <span>Premium Event Discovery</span>
            <span>Vendor Networking</span>
            <span>Sponsored Advertising</span>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelBadge">TOP RATED EVENT</div>

          <h3>Connecticut Spring Festival</h3>

          <div className="score">4.9</div>

          <p>
            Trusted by hundreds of vendors with premium customer traffic and
            high ROI potential.
          </p>

          <div className="miniStats">
            <div>
              <strong>22K+</strong>
              <span>Visitors</span>
            </div>

            <div>
              <strong>$95</strong>
              <span>Booth Fee</span>
            </div>

            <div>
              <strong>420+</strong>
              <span>Vendors</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE SPONSORED ADS */}
      {ads.length > 0 && (
        <section className="liveAdsSection">
          <div className="sectionHeader">
            <div>
              <div className="goldEyebrow">Sponsored Placements</div>
              <h2>Premium Businesses & Promotions</h2>
            </div>

            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/advertise")}
            >
              Advertise Here
            </button>
          </div>

          <div className="liveAdsGrid">
            {ads.map((ad) => (
              <div className="liveAdCard" key={ad.id}>
                <div
                  className="liveAdImage"
                  style={{
                    backgroundImage: `url(${
                      ad.image_url ||
                      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <span>Sponsored</span>
                </div>

                <div className="liveAdBody">
                  <p className="goldEyebrow">
                    {ad.business_name}
                  </p>

                  <h3>{ad.title}</h3>

                  <p className="muted">
                    {ad.description}
                  </p>

                  <div className="reviewBadges">
                    <span>{ad.placement}</span>
                    <span>Premium Ad</span>
                  </div>

                  {ad.link_url && (
                    <button
                      className="goldBtn fullWidth"
                      onClick={() =>
                        window.open(ad.link_url, "_blank")
                      }
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EVENTS */}
      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <div className="goldEyebrow">Featured Events</div>
            <h2>Top Rated Vendor Events</h2>
          </div>

          <button
            className="outlineBtn"
            onClick={() => (window.location.href = "/events")}
          >
            View All Events
          </button>
        </div>

        <div className="luxEventGrid">
          {events.map((event, index) => (
            <div key={index} className="luxEventCard">
              <div
                className="eventVisual"
                style={{
                  backgroundImage:
                    index === 0
                      ? "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop')"
                      : index === 1
                      ? "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop')"
                      : "url('https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1400&auto=format&fit=crop')",
                }}
              >
                <div className="eventOverlay">
                  <span>Featured Event</span>
                </div>
              </div>

              <div className="eventBody">
                <div className="eventDate">{event.date}</div>

                <h3>{event.title}</h3>

                <div className="muted">{event.location}</div>

                <div className="pillGrid">
                  <span>{event.rating}</span>
                  <span>{event.booth}</span>
                  <span>{event.visitors}</span>
                </div>

                <button className="fullBtn">
                  View Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <div className="goldEyebrow">Platform Features</div>
            <h2>Built For Serious Vendors</h2>
          </div>
        </div>

        <div className="featureGrid">
          <div className="featureBox">
            <h3>Verified Vendor Ratings</h3>

            <p>
              Only vendors who attended events can leave reviews and ratings.
              Prevent fake reviews and discover the highest ROI festivals.
            </p>
          </div>

          <div className="featureBox">
            <h3>Vendor Social Network</h3>

            <p>
              Vendors can upload videos, photos, booth setups, event
              experiences, and connect with other businesses like a premium
              event community.
            </p>
          </div>

          <div className="featureBox">
            <h3>Luxury Advertising System</h3>

            <p>
              Festivals, brands, and vendors can purchase sponsored placements,
              homepage sliders, featured ads, and premium visibility.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}