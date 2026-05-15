"use client";

import { useEffect, useState } from "react";
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

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);

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
            <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
              Find Events
            </button>

            <button className="outlineBtn" onClick={() => (window.location.href = "/create-event")}>
              List Your Event
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>Built for vendors</span>
            <span>Event ROI insights</span>
            <span>Organizer discovery</span>
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

          <button className="goldBtn fullWidth" onClick={() => (window.location.href = "/signup")}>
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

      {ads.length > 0 && (
        <section className="liveAdsSection">
          <div className="sectionHeader">
            <div>
              <p className="goldEyebrow">Sponsored Placements</p>
              <h2>Premium businesses promoted to vendors.</h2>
            </div>

            <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
              Advertise Here
            </button>
          </div>

          <div className="liveAdsGrid">
            {ads.slice(0, 3).map((ad) => (
              <article className="liveAdCard" key={ad.id}>
                <div
                  className="liveAdImage"
                  style={{ backgroundImage: `url(${ad.image_url || "/window.svg"})` }}
                >
                  <span>Sponsored</span>
                </div>

                <div className="liveAdBody">
                  <p className="goldEyebrow">{ad.business_name}</p>
                  <h3>{ad.title}</h3>
                  <p className="muted">{ad.description}</p>

                  {ad.link_url && (
                    <button className="goldBtn fullWidth" onClick={() => window.open(ad.link_url, "_blank")}>
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
            <p>Browse festivals, fairs, flea markets, farmers markets, expos, and pop-ups by category and location.</p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">02</span>
            <h3>Compare the opportunity</h3>
            <p>Review booth fees, expected traffic, vendor fit, organizer quality, and profitability signals.</p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">03</span>
            <h3>Book smarter</h3>
            <p>Choose events with stronger vendor potential and avoid shows that waste time, money, and inventory.</p>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Browse By Category</p>
            <h2>Find the right event for your business.</h2>
          </div>

          <button className="outlineBtn" onClick={() => (window.location.href = "/events")}>
            View All Events
          </button>
        </div>

        <div className="categoryLuxuryGrid">
          {categories.map((category) => (
            <button key={category} onClick={() => (window.location.href = "/events")}>
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
          <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
            Advertise Your Business
          </button>

          <button className="outlineBtn" onClick={() => (window.location.href = "/pricing")}>
            View Pricing
          </button>
        </div>
      </section>

      <section className="finalStartupCta">
        <p className="goldEyebrow">Start Growing Smarter</p>
        <h2>Build your vendor business with better event intelligence.</h2>

        <div className="heroActions">
          <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
            Explore Events
          </button>

          <button className="outlineBtn" onClick={() => (window.location.href = "/profile/setup")}>
            Create Vendor Profile
          </button>
        </div>
      </section>
    </main>
  );
}