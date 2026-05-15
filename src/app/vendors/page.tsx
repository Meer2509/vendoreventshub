"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const vendorTypes = [
  "Food Trucks",
  "Coffee Brands",
  "Wellness Brands",
  "Handmade Goods",
  "Artisan Vendors",
  "Farm Vendors",
  "Jewelry",
  "Candles",
  "Clothing",
  "Home Decor",
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Vendors");

  useEffect(() => {
    async function loadVendors() {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setVendors(data || []);
      }

      setLoading(false);
    }

    loadVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const text = search.toLowerCase();

      const matchesSearch =
        !text ||
        vendor.business_name?.toLowerCase().includes(text) ||
        vendor.category?.toLowerCase().includes(text) ||
        vendor.city?.toLowerCase().includes(text) ||
        vendor.state?.toLowerCase().includes(text) ||
        vendor.short_description?.toLowerCase().includes(text);

      const matchesCategory =
        category === "All Vendors" || vendor.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [vendors, search, category]);

  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Vendor Marketplace</p>

          <h1>Discover trusted vendors for your next event.</h1>

          <p className="heroText">
            Browse food trucks, artisan brands, makers, wellness vendors,
            handmade businesses, flea market sellers, festival vendors, and local
            businesses building their presence through VendorEventsHub.
          </p>

          <div className="heroActions">
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/profile/setup")}
            >
              Create Vendor Profile
            </button>

            <button
              className="outlineBtn"
              onClick={() => (window.location.href = "/events")}
            >
              Explore Events
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>Verified Vendors</span>
            <span>Festival Ready</span>
            <span>Business Profiles</span>
          </div>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Vendor Discovery</p>
          <h3>Find businesses ready for festivals, markets, and fairs.</h3>

          <div className="vhScoreCard">
            <div>
              <strong>{vendors.length}</strong>
              <span>Listed vendors</span>
            </div>
            <div>
              <strong>Local</strong>
              <span>Business discovery</span>
            </div>
            <div>
              <strong>Events</strong>
              <span>Festival ready</span>
            </div>
            <div>
              <strong>Ads</strong>
              <span>Featured vendors</span>
            </div>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Search Vendors</p>
            <h2>Find vendors by business, category, or location.</h2>
          </div>
        </div>

        <div className="luxSearch eventsSearch">
          <input
            placeholder="Search vendor name, category, city, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button>Search Vendors</button>
        </div>

        <div className="filterRow">
          {["All Vendors", "Food & Beverage", "Health & Wellness", "Handmade Goods", "Artisan Products", "Jewelry", "Food Truck"].map((item) => (
            <button key={item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          <div className="emptyStateCard">
            <h3>No vendors found.</h3>
            <p>
              Try another search or create the first premium vendor profile in
              this category.
            </p>
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/profile/setup")}
            >
              Create Vendor Profile
            </button>
          </div>
        ) : (
          <div className="vendorDirectoryGrid">
            {filteredVendors.map((vendor) => (
              <article className="vendorCard premiumVendorCard" key={vendor.id}>
                <div
                  className="vendorCardBanner"
                  style={{
                    backgroundImage: `url(${
                      vendor.banner_url ||
                      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                    })`,
                  }}
                />

                <div className="vendorCardBody">
                  <img
                    src={
                      vendor.logo_url ||
                      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
                    }
                    alt={vendor.business_name}
                    className="vendorCardLogo"
                  />

                  <p className="goldEyebrow">
                    {vendor.category || "Premium Vendor"}
                  </p>

                  <h3>{vendor.business_name}</h3>

                  <p className="muted">
                    {vendor.short_description ||
                      "A premium vendor business on VendorEventsHub."}
                  </p>

                  <div className="marketStats">
                    <span>
                      {vendor.city || "City"}, {vendor.state || "State"}
                    </span>
                    <span>{vendor.years_in_business || "New business"}</span>
                    <span>
                      {vendor.verified ? "Verified" : "Pending verification"}
                    </span>
                  </div>

                  <button
                    className="fullBtn"
                    onClick={() =>
                      (window.location.href = `/vendors/${vendor.slug}`)
                    }
                  >
                    View Vendor Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Browse By Vendor Type</p>
            <h2>Explore the vendor economy.</h2>
          </div>
        </div>

        <div className="categoryLuxuryGrid">
          {vendorTypes.map((type) => (
            <button key={type} onClick={() => setSearch(type)}>
              <span>{type}</span>
              <small>Discover businesses</small>
            </button>
          ))}
        </div>
      </section>

      <section className="luxSection">
        <div className="premiumCta">
          <p className="goldEyebrow">For Vendors</p>
          <h2>Turn your business profile into your event-ready storefront.</h2>
          <p>
            Create a profile with your logo, banner, story, category, links, and
            event presence so organizers and other vendors can discover your
            business.
          </p>

          <div className="heroActions">
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/profile/setup")}
            >
              Create Vendor Profile
            </button>

            <button
              className="outlineBtn"
              onClick={() => (window.location.href = "/pricing")}
            >
              View Founding Access
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}