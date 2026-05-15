"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="luxuryPage">
      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <div className="goldEyebrow">Vendor Directory</div>
            <h2>Discover premium vendor businesses.</h2>
            <p className="muted">
              Browse food brands, artisans, makers, service businesses, and
              event-ready vendors.
            </p>
          </div>

          <button
            className="goldBtn"
            onClick={() => (window.location.href = "/profile/setup")}
          >
            Create Vendor Profile
          </button>
        </div>

        <div className="luxSearch eventsSearch">
          <input placeholder="Search by business name, category, city..." />
          <button>Search Vendors</button>
        </div>

        {loading ? (
          <p className="muted">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="muted">No vendors listed yet.</p>
        ) : (
          <div className="vendorDirectoryGrid">
            {vendors.map((vendor) => (
              <article className="vendorCard" key={vendor.id}>
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
                    <span>{vendor.city || "City"}, {vendor.state || "State"}</span>
                    <span>{vendor.years_in_business || "New business"}</span>
                    <span>{vendor.verified ? "Verified" : "Pending verification"}</span>
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
    </main>
  );
}