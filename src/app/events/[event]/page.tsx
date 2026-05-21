"use client";

import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/seo";
import { buildSocialLinks } from "@/lib/social";
import { supabase } from "@/lib/supabase";

const bestFitByCategory: Record<string, string[]> = {
  Festival: ["Food Vendors", "Coffee Brands", "Crafts", "Wellness", "Local Retail"],
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
  return (
    bestFitByCategory[event?.category] || [
      "Food Vendors",
      "Coffee Brands",
      "Handmade Goods",
      "Wellness",
      "Local Services",
      "Boutique Retail",
    ]
  );
}

function formatDate(date: string) {
  if (!date) return "Date coming soon";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventDetailPage() {
  const params = useParams();
  const rawEvent = params.event;
  const eventId = Array.isArray(rawEvent) ? rawEvent[0] : (rawEvent as string);

  const [event, setEvent] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");

  useEffect(() => {
    async function loadPage() {
      const now = new Date().toISOString();

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      setEvent(eventData || null);

      if (eventData?.created_by) {
        const { data: organizerData } = await supabase
          .from("organizer_profiles")
          .select("*")
          .eq("user_id", eventData.created_by)
          .single();

        setOrganizer(organizerData || null);
      }

      const { data: reviewData } = await supabase
        .from("reviews_with_vendors")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      const { data: adData } = await supabase
        .from("ad_orders")
        .select("*")
        .eq("payment_status", "paid")
        .eq("approval_status", "approved")
        .in("placement", ["event_detail", "events", "category_sponsor"])
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      setReviews(reviewData || []);
      setSponsoredAds(adData || []);
      setLoading(false);
    }

    loadPage();
  }, [eventId]);

  const organizerSocialLinks = useMemo(() => {
    if (!organizer) return [];
    return buildSocialLinks(organizer);
  }, [organizer]);

  const intelligence = useMemo(() => {
    if (!event) return null;

    const booth = Number(event.booth_price || 0);
    const visitors = Number(String(event.expected_visitors || "").replace(/\D/g, "") || 0);
    const ratingValue = Number(event.rating || 0);
    const featured = Boolean(event.is_featured);
    const verified = Boolean(event.verified_organizer);
    const accepting = event.accepting_vendors !== false;

    let score = 55;

    if (visitors >= 10000) score += 20;
    else if (visitors >= 5000) score += 15;
    else if (visitors >= 1000) score += 10;
    else if (visitors > 0) score += 5;

    if (booth > 0 && booth <= 100) score += 15;
    else if (booth <= 250) score += 10;
    else if (booth <= 500) score += 5;

    if (ratingValue >= 4.8) score += 10;
    else if (ratingValue >= 4.3) score += 7;
    else if (ratingValue >= 3.8) score += 4;

    if (featured) score += 5;
    if (verified) score += 4;
    if (accepting) score += 2;

    score = Math.min(score, 99);

    const boothValue =
      booth === 0
        ? "Not Listed"
        : booth <= 100
        ? "Excellent"
        : booth <= 250
        ? "Strong"
        : booth <= 500
        ? "Moderate"
        : "Premium";

    const traffic =
      visitors >= 10000
        ? "Very High"
        : visitors >= 5000
        ? "High"
        : visitors >= 1000
        ? "Strong Local"
        : visitors > 0
        ? "Local"
        : "TBD";

    const recommendation =
      score >= 86
        ? "Strong opportunity for vendors"
        : score >= 74
        ? "Worth reviewing closely"
        : score >= 62
        ? "Good potential with more details"
        : "New listing — verify details";

    const roiSignal =
      booth > 0 && visitors > 0
        ? `${Math.round(visitors / booth)} visitors per booth dollar`
        : "ROI signal needs more data";

    return {
      score,
      boothValue,
      traffic,
      recommendation,
      roiSignal,
      visitors,
      booth,
      ratingValue,
      featured,
      verified,
      accepting,
    };
  }, [event]);

  const structuredData = useMemo(() => {
    if (!event) return [];

    const breadcrumbs = {
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
          name: "Events",
          item: absoluteUrl("/events"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: event.title,
          item: absoluteUrl(`/events/${event.id}`),
        },
      ],
    };

    const eventSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description || undefined,
      startDate: event.event_date || undefined,
      url: absoluteUrl(`/events/${event.id}`),
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: [event.city, event.state].filter(Boolean).join(", "),
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city || undefined,
          addressRegion: event.state || undefined,
          postalCode: event.zip_code || undefined,
          addressCountry: "US",
        },
      },
    };

    if (event.booth_price) {
      eventSchema.offers = {
        "@type": "Offer",
        price: event.booth_price,
        priceCurrency: "USD",
        url: absoluteUrl(`/events/${event.id}`),
      };
    }

    if (event.image_url) {
      eventSchema.image = event.image_url;
    }

    return [breadcrumbs, eventSchema];
  }, [event]);

  async function saveEvent() {
    const { user } = await getAuthUser();

    if (!user) {
      alert("Please login first to save this event.");
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

  async function applyAsVendor() {
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

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();

    const { user } = await getAuthUser();

    if (!user) {
      alert("Please login first to leave a review.");
      window.location.href = "/login/vendor";
      return;
    }

    const { data: attendance } = await supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", eventId)
      .eq("vendor_id", user.id)
      .in("status", ["approved", "attended"])
      .single();

    if (!attendance) {
      alert(
        "Only approved or attended vendors can review this event. Apply first, then the organizer must approve attendance."
      );
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      event_id: eventId,
      vendor_id: user.id,
      rating: Number(rating),
      review,
      attended: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Review submitted successfully.");
    window.location.reload();
  }

  if (loading) {
    return (
      <main className="eventPage">
        <section className="loadingSection">
          <p className="eyebrow">VendorEventsHub</p>
          <h1>Loading premium event intelligence...</h1>
        </section>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="eventPage">
        <section className="loadingSection">
          <p className="eyebrow">Event Not Found</p>
          <h1>This event may have been removed.</h1>
          <button onClick={() => (window.location.href = "/events")}>
            Back To Events
          </button>
        </section>
      </main>
    );
  }

  const bestFitBadges = getBestFitBadges(event);
  const primaryAd = sponsoredAds[0];

  return (
    <main className="eventPage">
      <JsonLd data={structuredData} />
      <section
        className="eventHero"
        style={{
          backgroundImage: `url(${
            event.image_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop"
          })`,
        }}
      >
        <div className="heroOverlay">
          <div className="heroInner">
            <div>
              <p className="eyebrow">
                {event.is_featured ? "Featured Premium Event" : "Vendor Event Intelligence"}
              </p>
              <h1>{event.title}</h1>

              <div className="heroMeta">
                <span>{formatDate(event.event_date)}</span>
                <span>
                  {event.city}, {event.state} {event.zip_code}
                </span>
                <span>{event.category || "Vendor Event"}</span>
                <span>★ {event.rating || "New"} Vendor Rating</span>
              </div>

              <div className="heroActions">
                <button type="button" className="btn btn-primary" onClick={applyAsVendor}>
                  Apply As Vendor
                </button>
                <button type="button" className="btn btn-secondary" onClick={saveEvent}>
                  Save Event
                </button>
              </div>
            </div>

            <div className="scorePanel">
              <p className="panelBadge">Vendor Score™</p>
              <div className="scoreCircle">{intelligence?.score}</div>
              <h3>{intelligence?.recommendation}</h3>
              <p>{intelligence?.roiSignal}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contentSection">
        <div className="eventGrid">
          <div className="mainColumn">
            {organizer && (
              <section className="detailCard organizerFeatureCard">
                <div className="organizerFeatureHeader">
                  <img
                    src={
                      organizer.logo_url ||
                      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
                    }
                    alt={organizer.organizer_name || "Organizer"}
                    className="organizerLogo"
                  />

                  <div>
                    <p className="eyebrow">Hosted By</p>
                    <h2>{organizer.organizer_name}</h2>
                    <p>
                      {organizer.short_description ||
                        "This organizer has added a public profile to help vendors learn more before applying."}
                    </p>
                  </div>
                </div>

                <div className="organizerActions">
                  {organizer.slug && (
                    <Link
                      className="btn btn-secondary"
                      href={`/organizers/${organizer.slug}`}
                    >
                      View Organizer Profile
                    </Link>
                  )}

                  {organizerSocialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`socialButton ${item.className}`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">Event Intelligence</p>
                <h2>Should vendors review this opportunity?</h2>
                <p>
                  This score combines booth value, traffic signals, organizer
                  trust, ratings, and listing strength to help vendors make a
                  better decision before spending money.
                </p>
              </div>

              <div className="intelligenceGrid">
                <div>
                  <strong>{intelligence?.score}/100</strong>
                  <span>Vendor Score™</span>
                </div>
                <div>
                  <strong>{intelligence?.boothValue}</strong>
                  <span>Booth Value</span>
                </div>
                <div>
                  <strong>{intelligence?.traffic}</strong>
                  <span>Traffic Signal</span>
                </div>
                <div>
                  <strong>{intelligence?.recommendation}</strong>
                  <span>Recommendation</span>
                </div>
              </div>
            </section>

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">About This Event</p>
                <h2>Event details vendors need before applying.</h2>
              </div>
              <p className="descriptionText">
                {event.description || "No description added yet."}
              </p>
            </section>

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">Best Vendor Fit</p>
                <h2>Vendor categories that may perform well here.</h2>
              </div>

              <div className="pillGrid">
                {bestFitBadges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            </section>

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">Organizer Trust</p>
                <h2>Transparency signals for vendors.</h2>
              </div>

              <div className="trustGrid">
                <div>
                  <strong>{event.verified_organizer ? "Verified" : organizer ? "Profile Added" : "Listed"}</strong>
                  <span>Organizer Status</span>
                </div>
                <div>
                  <strong>{event.accepting_vendors !== false ? "Yes" : "Check First"}</strong>
                  <span>Vendors Wanted</span>
                </div>
                <div>
                  <strong>{reviews.length}</strong>
                  <span>Vendor Reviews</span>
                </div>
                <div>
                  <strong>{organizerSocialLinks.length > 0 ? "Available" : "Not Added"}</strong>
                  <span>Social Proof</span>
                </div>
              </div>
            </section>

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">Vendor Reviews</p>
                <h2>Real vendor experience builds marketplace trust.</h2>
              </div>

              {reviews.length === 0 ? (
                <div className="reviewCard">
                  <div className="reviewTop">
                    <strong>Verified Vendor Review</strong>
                    <span>New Event</span>
                  </div>
                  <p>
                    Reviews will appear after verified vendors attend and rate
                    this event. This helps future vendors understand traffic,
                    setup, organizer quality, and sales potential.
                  </p>
                </div>
              ) : (
                reviews.map((item) => (
                  <div className="reviewCard" key={item.id}>
                    <div className="vendorReviewHeader">
                      <img
                        src={
                          item.logo_url ||
                          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop"
                        }
                        alt={item.business_name || "Vendor"}
                        className="reviewVendorLogo"
                      />

                      <div>
                        <strong>{item.business_name || "Verified Vendor"}</strong>
                        <div className="reviewBadges">
                          <span>★ {item.rating}</span>
                          <span>{item.verified ? "Verified Vendor" : "Vendor"}</span>
                          <span>Attended Event</span>
                        </div>
                      </div>
                    </div>

                    <p>{item.review}</p>

                    {item.slug && (
                      <button
                        className="secondary smallBtn"
                        onClick={() => (window.location.href = `/vendors/${item.slug}`)}
                      >
                        View Vendor Profile
                      </button>
                    )}
                  </div>
                ))
              )}
            </section>

            <section className="detailCard">
              <div className="sectionHead">
                <p className="eyebrow">Leave A Review</p>
                <h2>Share verified vendor experience.</h2>
                <p>
                  Only approved or attended vendors can leave reviews. This
                  protects trust and keeps event feedback useful.
                </p>
              </div>

              <form onSubmit={submitReview} className="reviewForm">
                <label>
                  Rating
                  <select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </label>

                <label>
                  Your Review
                  <textarea
                    required
                    placeholder="Share your vendor experience, traffic, sales potential, setup, organization, and if you would attend again."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </label>

                <button type="submit">Submit Verified Review</button>
              </form>
            </section>
          </div>

          <aside className="sidebar">
            <div className="sidebarCard stickyCard">
              <p className="eyebrow">Quick Snapshot</p>

              <div className="sidebarInfo">
                <span>Vendor Score™</span>
                <strong>{intelligence?.score}/100</strong>
              </div>

              <div className="sidebarInfo">
                <span>Booth Fee</span>
                <strong>${event.booth_price || "TBD"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Expected Visitors</span>
                <strong>{event.expected_visitors || "TBD"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Traffic Signal</span>
                <strong>{intelligence?.traffic}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Event Type</span>
                <strong>{event.category || "Vendor Event"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Date</span>
                <strong>{formatDate(event.event_date)}</strong>
              </div>

              {organizer && (
                <div className="sidebarInfo">
                  <span>Organizer</span>
                  <strong>{organizer.organizer_name}</strong>
                </div>
              )}

              <div className="sidebarCtaStack">
                <button type="button" className="btn btn-primary btn-block" onClick={applyAsVendor}>
                  Apply As Vendor
                </button>
                <button type="button" className="btn btn-secondary btn-block" onClick={saveEvent}>
                  Save Event
                </button>
              </div>
            </div>

            {organizer && (
              <div className="sidebarCard organizerMiniCard">
                <p className="eyebrow">Organizer</p>
                <h3>{organizer.organizer_name}</h3>
                <p>
                  {organizer.short_description ||
                    "View this organizer’s public profile and social channels before applying."}
                </p>

                {organizer.slug && (
                  <Link className="btn btn-secondary btn-block" href={`/organizers/${organizer.slug}`}>
                    View Organizer Profile
                  </Link>
                )}

                {organizerSocialLinks.length > 0 && (
                  <div className="miniSocialGrid">
                    {organizerSocialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`socialButton ${item.className}`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {primaryAd ? (
              <div className="sidebarCard sponsorCard">
                <div
                  className="sponsorImage"
                  style={{
                    backgroundImage: `url(${
                      primaryAd.image_url ||
                      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <span>Sponsored</span>
                </div>
                <p className="eyebrow">{primaryAd.business_name || "Sponsored Partner"}</p>
                <h3>{primaryAd.ad_title || "Premium Sponsored Placement"}</h3>
                <p>
                  {primaryAd.ad_description ||
                    "A premium business promoted through VendorEventsHub."}
                </p>
                {primaryAd.link_url && (
                  <button onClick={() => window.open(primaryAd.link_url, "_blank")}>
                    Visit Website
                  </button>
                )}
              </div>
            ) : (
              <div className="sidebarCard sponsorCard">
                <p className="eyebrow">Sponsored Placement</p>
                <h3>Advertise your business beside event listings.</h3>
                <p>
                  Reach vendors while they are actively researching booth
                  opportunities and event decisions.
                </p>
                <button
                  className="secondary"
                  onClick={() => (window.location.href = "/advertise")}
                >
                  Advertise Here
                </button>
              </div>
            )}

            <div className="sidebarCard">
              <p className="eyebrow">Trust & Safety</p>
              <div className="sidebarInfo">
                <span>Review Access</span>
                <strong>Verified Vendors</strong>
              </div>
              <div className="sidebarInfo">
                <span>Listing Status</span>
                <strong>{event.is_featured ? "Featured" : "Listed"}</strong>
              </div>
              <div className="sidebarInfo">
                <span>Organizer Signal</span>
                <strong>{organizer ? "Profile Added" : "Standard"}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .eventPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        .loadingSection {
          max-width: 1180px;
          margin: 0 auto;
          min-height: 70vh;
          padding: 90px 18px;
        }

        .eventHero {
          min-height: 82vh;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .heroOverlay {
          min-height: 82vh;
          background:
            linear-gradient(90deg, rgba(16, 41, 31, 0.92), rgba(16, 41, 31, 0.62), rgba(16, 41, 31, 0.2));
          display: flex;
          align-items: center;
        }

        .heroInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 80px 18px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
          width: 100%;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        .eventHero h1 {
          color: white;
          font-size: clamp(50px, 8vw, 96px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
          max-width: 850px;
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

        .heroMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .heroMeta span {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
          backdrop-filter: blur(10px);
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .heroActions :global(.btn) {
          min-width: 168px;
        }

        .sidebarCtaStack {
          display: grid;
          gap: 10px;
          margin-top: 8px;
        }

        .stickyCard {
          position: sticky;
          top: 96px;
        }

        .smallBtn {
          width: auto;
          padding: 11px 16px;
        }

        .scorePanel,
        .detailCard,
        .sidebarCard {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .scorePanel {
          padding: 36px;
          text-align: center;
        }

        .scorePanel p,
        .organizerFeatureCard p,
        .organizerMiniCard p {
          color: #5f6b66;
          line-height: 1.6;
        }

        .panelBadge {
          display: inline-block;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 18px;
        }

        .scoreCircle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f7f1e6;
          border: 13px solid #b88a2e;
          font-size: 52px;
          font-weight: 1000;
          margin: 26px auto;
        }

        .contentSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .eventGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 22px;
          align-items: start;
        }

        .mainColumn {
          display: grid;
          gap: 22px;
        }

        .detailCard,
        .sidebarCard {
          padding: 30px;
        }

        .organizerFeatureHeader {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 18px;
          align-items: center;
        }

        .organizerLogo {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          object-fit: cover;
          border: 4px solid #f7f1e6;
          box-shadow: 0 14px 32px rgba(16, 41, 31, 0.16);
        }

        .organizerActions,
        .miniSocialGrid {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .organizerActions {
          grid-template-columns: repeat(2, 1fr);
        }

        .socialButton {
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
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

        .sectionHead {
          margin-bottom: 24px;
        }

        .sectionHead p,
        .descriptionText,
        .reviewCard p,
        .sponsorCard p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .intelligenceGrid,
        .trustGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .intelligenceGrid div,
        .trustGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 20px;
        }

        .intelligenceGrid strong,
        .trustGrid strong {
          display: block;
          font-size: 25px;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .intelligenceGrid span,
        .trustGrid span {
          color: #5f6b66;
          font-size: 13px;
          font-weight: 800;
        }

        .pillGrid,
        .reviewBadges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pillGrid span,
        .reviewBadges span {
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 850;
          background: #f7f1e6;
        }

        .reviewCard {
          background: #f7f1e6;
          border-radius: 26px;
          padding: 22px;
          margin-top: 14px;
        }

        .reviewTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .vendorReviewHeader {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 14px;
        }

        .reviewVendorLogo {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          object-fit: cover;
        }

        .reviewForm {
          display: grid;
          gap: 18px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #d8ccb5;
          border-radius: 18px;
          padding: 14px 16px;
          font: inherit;
          background: white;
          color: #10291f;
        }

        textarea {
          min-height: 150px;
          resize: vertical;
        }

        .sidebar {
          display: grid;
          gap: 18px;
        }

        .stickyCard {
          position: sticky;
          top: 18px;
          z-index: 2;
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
          margin-top: 14px;
        }

        .sponsorImage {
          min-height: 190px;
          background-size: cover;
          background-position: center;
          border-radius: 24px;
          position: relative;
          margin-bottom: 18px;
        }

        .sponsorImage span {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
        }

        @media (max-width: 980px) {
          .heroInner,
          .eventGrid,
          .intelligenceGrid,
          .trustGrid,
          .organizerFeatureHeader,
          .organizerActions {
            grid-template-columns: 1fr;
          }

          .eventHero,
          .heroOverlay {
            min-height: auto;
          }

          .heroInner {
            padding: 76px 16px;
          }

          .eventHero h1 {
            font-size: 54px;
          }

          .contentSection {
            padding: 54px 16px;
          }

          .stickyCard {
            position: static;
          }

          .heroActions button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}