"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.event as string;

  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      setEvent(eventData);

      const { data: reviewData } = await supabase
        .from("reviews_with_vendors")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      setReviews(reviewData || []);
      setLoading(false);
    }

    loadPage();
  }, [eventId]);

  const intelligence = useMemo(() => {
    if (!event) return null;

    const booth = Number(event.booth_price || 0);
    const visitors = Number(event.expected_visitors || 0);
    const ratingValue = Number(event.rating || 0);
    const featured = Boolean(event.is_featured);

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

    score = Math.min(score, 98);

    const boothValue =
      booth === 0
        ? "Not listed"
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
        ? "Medium"
        : visitors > 0
        ? "Local"
        : "TBD";

    const opportunity =
      score >= 85 ? "Excellent" : score >= 72 ? "Strong" : score >= 60 ? "Good" : "New";

    return { score, boothValue, traffic, opportunity };
  }, [event]);

  async function applyAsVendor() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first to apply as a vendor.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("event_attendance").insert({
      event_id: eventId,
      vendor_id: userData.user.id,
      status: "requested",
    });

    if (error) {
      if (error.message.includes("duplicate")) {
        alert("You already applied for this event.");
      } else {
        alert(error.message);
      }
      return;
    }

    alert("Application request sent successfully.");
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first to leave a review.");
      window.location.href = "/login";
      return;
    }

    const { data: attendance } = await supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", eventId)
      .eq("vendor_id", userData.user.id)
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
      vendor_id: userData.user.id,
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
      <main className="luxuryPage">
        <section className="luxSection">
          <p className="muted">Loading premium event intelligence...</p>
        </section>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="luxuryPage">
        <section className="luxSection">
          <h1>Event not found</h1>
          <p className="muted">This event may have been removed.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="luxuryPage">
      <section
        className="eventHero"
        style={{
          backgroundImage: `url(${
            event.image_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop"
          })`,
        }}
      >
        <div className="eventHeroOverlay">
          <div className="luxSection">
            <div className="goldEyebrow">
              {event.is_featured ? "Featured Premium Event" : "Vendor Event Intelligence"}
            </div>

            <h1 className="eventTitleHero">{event.title}</h1>

            <div className="eventHeroMeta">
              <span>★ {event.rating || "New"} Vendor Rating</span>
              <span>{event.city}, {event.state}</span>
              <span>{event.expected_visitors || "TBD"} Visitors</span>
              <span>{event.category || "Vendor Event"}</span>
              <span>Vendor Profit Score: {intelligence?.score}/100</span>
            </div>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="eventPageGrid">
          <div>
            <div className="detailCard">
              <p className="goldEyebrow">Vendor Intelligence</p>
              <h2>Vendor Opportunity Score</h2>

              <div className="eventInfoGrid">
                <div>
                  <strong>{intelligence?.score}/100</strong>
                  <p>Overall vendor opportunity based on traffic, booth fee, rating, and featured status.</p>
                </div>

                <div>
                  <strong>{intelligence?.opportunity}</strong>
                  <p>Estimated event potential for serious vendors looking for profitable local exposure.</p>
                </div>

                <div>
                  <strong>{intelligence?.boothValue}</strong>
                  <p>Booth value based on the listed vendor fee compared with expected attendance.</p>
                </div>

                <div>
                  <strong>{intelligence?.traffic}</strong>
                  <p>Expected traffic level based on the visitor count listed by the organizer.</p>
                </div>
              </div>
            </div>

            <div className="detailCard">
              <h2>About This Event</h2>
              <p>{event.description || "No description added yet."}</p>
            </div>

            <div className="detailCard">
              <h2>Best Vendor Fit</h2>
              <p>
                This event may be a strong fit for food vendors, coffee brands, handmade goods,
                wellness products, farm products, boutique retail, local services, artists, and
                community-focused businesses.
              </p>

              <div className="pillGrid">
                <span>Food Vendors</span>
                <span>Coffee Brands</span>
                <span>Handmade Goods</span>
                <span>Wellness</span>
                <span>Farm Products</span>
                <span>Local Services</span>
              </div>
            </div>

            <div className="detailCard">
              <h2>Vendor Experience</h2>

              {reviews.length === 0 ? (
                <div className="reviewCard">
                  <div className="reviewTop">
                    <strong>Verified Vendor Review</strong>
                    <span>★ New</span>
                  </div>
                  <p>
                    Reviews will appear here after verified vendors attend and rate this event.
                    This helps future vendors understand traffic, setup, organizer quality, and
                    sales potential.
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
                        className="outlineBtn"
                        onClick={() => (window.location.href = `/vendors/${item.slug}`)}
                      >
                        View Vendor Profile
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="detailCard">
              <h2>Leave A Verified Vendor Review</h2>

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

                <button className="goldBtn" type="submit">
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>

          <aside className="eventSidebar">
            <div className="sidebarCard">
              <h3>Quick Event Snapshot</h3>

              <div className="sidebarInfo">
                <span>Vendor Profit Score</span>
                <strong>{intelligence?.score}/100</strong>
              </div>

              <div className="sidebarInfo">
                <span>Booth Value</span>
                <strong>{intelligence?.boothValue}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Booth Fee</span>
                <strong>${event.booth_price || "TBD"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Event Type</span>
                <strong>{event.category || "Vendor Event"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Date</span>
                <strong>{event.event_date || "Coming soon"}</strong>
              </div>

              <div className="sidebarInfo">
                <span>Location</span>
                <strong>
                  {event.city}, {event.state} {event.zip_code}
                </strong>
              </div>

              <div className="sidebarInfo">
                <span>Expected Visitors</span>
                <strong>{event.expected_visitors || "TBD"}</strong>
              </div>

              <button onClick={applyAsVendor} className="goldBtn fullWidth">
                Apply As Vendor
              </button>
            </div>

            <div className="sidebarCard">
              <h3>Trust & Safety</h3>

              <div className="sidebarInfo">
                <span>Scam Risk</span>
                <strong>Low</strong>
              </div>

              <div className="sidebarInfo">
                <span>Review Access</span>
                <strong>Verified Vendors Only</strong>
              </div>

              <div className="sidebarInfo">
                <span>Organizer Status</span>
                <strong>{event.is_featured ? "Featured" : "Listed"}</strong>
              </div>
            </div>

            <div className="sidebarCard sponsorCard">
              <p>Sponsored Placement</p>
              <h3>Advertise Your Vendor Brand Here</h3>
              <button
                className="outlineBtn fullWidth"
                onClick={() => (window.location.href = "/advertise")}
              >
                Learn More
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}