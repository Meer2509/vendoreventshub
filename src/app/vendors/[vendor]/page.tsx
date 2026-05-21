"use client";

import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { buildSocialLinks } from "@/lib/social";
import { supabase } from "@/lib/supabase";

export default function VendorProfilePage() {
  const params = useParams();
  const vendorSlug = params.vendor as string;

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendor() {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("slug", vendorSlug)
        .single();

      if (error) {
        setVendor(null);
      } else {
        setVendor(data);
      }

      setLoading(false);
    }

    loadVendor();
  }, [vendorSlug]);

  const structuredData = useMemo(() => {
    if (!vendor) return [];

    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Vendors",
            item: absoluteUrl("/vendors"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: vendor.business_name || "Vendor",
            item: absoluteUrl(`/vendors/${vendor.slug}`),
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: vendor.business_name,
        description: vendor.short_description || vendor.description,
        url: absoluteUrl(`/vendors/${vendor.slug}`),
        image: vendor.logo_url || undefined,
      },
    ];
  }, [vendor]);

  if (loading) {
    return (
      <main className="luxuryPage">
        <section className="luxSection">
          <p className="muted">Loading vendor profile...</p>
        </section>
      </main>
    );
  }

  if (!vendor) {
    return (
      <main className="luxuryPage">
        <section className="luxSection">
          <div className="premiumEmptyState">
            <p className="premiumEmptyEyebrow">Vendor Profile</p>
            <h3>Vendor not found</h3>
            <p>This vendor profile may not exist yet or the URL may be incorrect.</p>
            <div className="premiumEmptyActions">
              <button
                className="goldBtn"
                onClick={() => (window.location.href = "/vendors")}
              >
                Browse Vendors
              </button>
              <button
                className="outlineBtn"
                onClick={() => (window.location.href = "/profile/setup")}
              >
                Create Vendor Profile
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const socialLinks = buildSocialLinks(vendor);

  return (
    <main className="vendorProfilePage">
      <JsonLd data={structuredData} />
      <section
        className="vendorHero"
        style={{
          backgroundImage: `url(${
            vendor.banner_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
          })`,
        }}
      >
        <div className="heroOverlay">
          <div className="heroInner">
            <img
              src={
                vendor.logo_url ||
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
              }
              alt={vendor.business_name || "Vendor"}
              className="vendorLogo"
            />

            <p className="eyebrow">{vendor.category || "Premium Vendor"}</p>
            <h1>{vendor.business_name}</h1>

            <p className="heroText">
              {vendor.short_description ||
                "A premium vendor business listed on VendorEventsHub."}
            </p>

            <div className="trustRow">
              <span>
                {vendor.city || "City"}, {vendor.state || "State"}
              </span>
              <span>{vendor.years_in_business || "New business"}</span>
              <span>{vendor.verified ? "Verified Vendor" : "Profile Listed"}</span>
            </div>

            <div className="heroActions">
              {vendor.website && (
                <button onClick={() => window.open(vendor.website, "_blank")}>
                  Visit Website
                </button>
              )}

              <button
                className="secondary"
                onClick={() => (window.location.href = "/events")}
              >
                View Events
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="contentSection">
        <div className="profileGrid">
          <div className="mainColumn">
            <div className="detailCard">
              <p className="eyebrow">About This Vendor</p>
              <h2>Business story and event presence.</h2>
              <p>
                {vendor.full_description ||
                  vendor.short_description ||
                  "This vendor has not added a full business story yet."}
              </p>
            </div>

            <div className="detailCard">
              <p className="eyebrow">Vendor Trust</p>
              <h2>Why organizers may consider this business.</h2>

              <div className="trustGrid">
                <div>
                  <strong>{vendor.category || "Vendor"}</strong>
                  <span>Business Category</span>
                </div>

                <div>
                  <strong>{vendor.city || "Local"}</strong>
                  <span>Base City</span>
                </div>

                <div>
                  <strong>{vendor.state || "USA"}</strong>
                  <span>State</span>
                </div>

                <div>
                  <strong>{vendor.verified ? "Verified" : "Listed"}</strong>
                  <span>Profile Status</span>
                </div>
              </div>
            </div>

            <div className="detailCard">
              <p className="eyebrow">Best For</p>
              <h2>Event opportunities this vendor may fit.</h2>

              <div className="pillGrid">
                <span>Festivals</span>
                <span>Farmers Markets</span>
                <span>Craft Fairs</span>
                <span>Pop-Ups</span>
                <span>Community Events</span>
                <span>Local Markets</span>
              </div>
            </div>
          </div>

          <aside className="sidebar">
            <div className="sidebarCard">
              <p className="eyebrow">Vendor Snapshot</p>

              <div className="sidebarInfo">
                <span>Business</span>
                <strong>{vendor.business_name}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Category</span>
                <strong>{vendor.category || "Vendor"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Location</span>
                <strong>
                  {vendor.city || "City"}, {vendor.state || "State"}
                </strong>
              </div>

              <div className="sidebarInfo">
                <span>Years</span>
                <strong>{vendor.years_in_business || "New"}</strong>
              </div>

              {vendor.phone && (
                <div className="sidebarInfo">
                  <span>Phone</span>
                  <strong>{vendor.phone}</strong>
                </div>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="sidebarCard">
                <p className="eyebrow">Connect With This Vendor</p>

                <div className="socialGrid">
                  {socialLinks.map((item) => (
                    <button
                      key={item.label}
                      className={`socialButton ${item.className}`}
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebarCard sponsorCard">
              <p className="eyebrow">For Organizers</p>
              <h3>Want vendors like this at your event?</h3>
              <p>
                List your festival, fair, market, expo, or pop-up and make it
                easier for vendors to discover your opportunity.
              </p>
              <button onClick={() => (window.location.href = "/create-event")}>
                List Your Event
              </button>
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .vendorProfilePage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        .vendorHero {
          min-height: 82vh;
          background-size: cover;
          background-position: center;
        }

        .heroOverlay {
          min-height: 82vh;
          background: linear-gradient(
            90deg,
            rgba(16, 41, 31, 0.92),
            rgba(16, 41, 31, 0.66),
            rgba(16, 41, 31, 0.25)
          );
          display: flex;
          align-items: center;
        }

        .heroInner {
          max-width: 1180px;
          width: 100%;
          margin: 0 auto;
          padding: 80px 18px;
        }

        .vendorLogo {
          width: 132px;
          height: 132px;
          border-radius: 32px;
          object-fit: cover;
          border: 5px solid #f7f1e6;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
          margin-bottom: 24px;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        h1 {
          color: white;
          font-size: clamp(52px, 8vw, 96px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
          max-width: 900px;
        }

        h2 {
          font-size: clamp(34px, 5vw, 58px);
          line-height: 0.94;
          letter-spacing: -0.06em;
          margin: 0;
        }

        h3 {
          font-size: 25px;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .heroText {
          max-width: 720px;
          color: rgba(255, 255, 255, 0.84);
          font-size: 18px;
          line-height: 1.75;
          margin-top: 24px;
        }

        .trustRow,
        .pillGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .trustRow span,
        .pillGrid span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 15px 24px;
          font-weight: 950;
          cursor: pointer;
          transition: 0.2s ease;
          width: 100%;
        }

        .heroActions button {
          width: auto;
          background: #b88a2e;
        }

        button.secondary {
          background: rgba(255, 255, 255, 0.72);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.22);
        }

        .contentSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .profileGrid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 22px;
          align-items: start;
        }

        .mainColumn,
        .sidebar {
          display: grid;
          gap: 22px;
        }

        .detailCard,
        .sidebarCard {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
          padding: 30px;
        }

        .detailCard p,
        .sidebarCard p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .trustGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 24px;
        }

        .trustGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 20px;
        }

        .trustGrid strong {
          display: block;
          font-size: 22px;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .trustGrid span {
          color: #5f6b66;
          font-size: 13px;
          font-weight: 800;
        }

        .sidebarInfo {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #eadfc9;
          padding: 14px 0;
        }

        .sidebarInfo span {
          color: #5f6b66;
          font-weight: 800;
        }

        .sidebarInfo strong {
          text-align: right;
        }

        .sidebarCard button {
          margin-top: 12px;
        }

        .socialGrid {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }

        .socialButton {
          width: 100%;
          border-radius: 20px;
          font-size: 15px;
          padding: 16px 18px;
          font-weight: 950;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .website {
          background: #10291f;
        }

        .instagram {
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
        }

        .tiktok {
          background: #000;
        }

        .facebook {
          background: #1877f2;
        }

        @media (max-width: 980px) {
          .profileGrid,
          .trustGrid {
            grid-template-columns: 1fr;
          }

          .vendorHero,
          .heroOverlay {
            min-height: auto;
          }

          .heroInner {
            padding: 76px 16px;
          }

          h1 {
            font-size: 54px;
          }

          .contentSection {
            padding: 54px 16px;
          }

          .heroActions button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}