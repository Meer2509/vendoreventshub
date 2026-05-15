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
      <section className="startupHero">
        <div className="startupHeroText">
          <p className="goldEyebrow">America’s Premium Vendor Event Platform</p>

          <h1>Find profitable vendor events before wasting money on bad shows.</h1>

          <p className="heroText">
            Compare vendor reviews, booth fees, attendance, organizer reputation,
            customer traffic, and real vendor experiences before booking your
            next festival, fair, flea market, craft show, or farmers market.
          </p>

          <div className="heroActions">
            <button className="goldBtn" onClick={() => (window.location.href = "/events")}>
              Explore Events
            </button>

            <button className="outlineBtn" onClick={() => (window.location.href = "/create-event")}>
              List Your Event
            </button>
          </div>

          <div className="startupTrustBar">
            <span>Verified Vendor Reviews</span>
            <span>Premium Event Discovery</span>
            <span>Vendor Networking</span>
            <span>Sponsored Advertising</span>
          </div>
        </div>

        <div className="startupHeroCard">
          <p className="panelBadge">Top Rated Event</p>
          <h3>Connecticut Spring Festival</h3>
          <div className="score">4.9</div>
          <p>Premium crowd, strong vendor ROI, and trusted organizer reputation.</p>

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
                  style={{
                    backgroundImage: `url(${ad.image_url || "/window.svg"})`,
                  }}
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
            <p className="goldEyebrow">Featured Discovery</p>
            <h2>Everything vendors need before booking a booth.</h2>
          </div>
        </div>

        <div className="featureGrid">
          <div className="featureBox">
            <h3>Avoid bad events</h3>
            <p>See real vendor experiences before paying booth fees or traveling.</p>
          </div>

          <div className="featureBox">
            <h3>Verified vendor reviews</h3>
            <p>Only approved or attended vendors can leave trusted reviews.</p>
          </div>

          <div className="featureBox">
            <h3>Better event ROI</h3>
            <p>Compare traffic, booth cost, category fit, and profitability signals.</p>
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

      <section className="luxSection">
        <div className="premiumCta">
          <p className="goldEyebrow">For Organizers & Brands</p>
          <h2>Advertise directly to vendors looking for profitable opportunities.</h2>
          <p>
            Promote festivals, markets, vendor services, food trucks, business
            tools, booth equipment, and premium event placements.
          </p>

          <div className="heroActions">
            <button className="goldBtn" onClick={() => (window.location.href = "/advertise")}>
              Advertise Your Business
            </button>
            <button className="outlineBtn" onClick={() => (window.location.href = "/pricing")}>
              View Pricing
            </button>
          </div>
        </div>
      </section>

      <section className="finalStartupCta">
        <p className="goldEyebrow">Start Growing Smarter</p>
        <h2>Ready to find better events and grow your vendor business?</h2>

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