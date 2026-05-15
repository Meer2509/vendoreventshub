"use client";

import { useEffect, useState } from "react";
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
          <p className="muted">Loading event...</p>
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
            <div className="goldEyebrow">Verified Premium Event</div>
            <h1 className="eventTitleHero">{event.title}</h1>

            <div className="eventHeroMeta">
              <span>★ {event.rating || "New"} Vendor Rating</span>
              <span>{event.city}, {event.state}</span>
              <span>{event.expected_visitors || "TBD"} Visitors</span>
              <span>{event.category || "Vendor Event"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="eventPageGrid">
          <div>
            <div className="detailCard">
              <h2>About This Event</h2>
              <p>{event.description || "No description added yet."}</p>
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
                    Reviews will appear here after verified vendors attend and
                    rate this event.
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
                          <span>
                            {item.verified ? "Verified Vendor" : "Vendor"}
                          </span>
                          <span>Attended Event</span>
                        </div>
                      </div>
                    </div>

                    <p>{item.review}</p>

                    {item.slug && (
                      <button
                        className="outlineBtn"
                        onClick={() =>
                          (window.location.href = `/vendors/${item.slug}`)
                        }
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
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          <aside className="eventSidebar">
            <div className="sidebarCard">
              <h3>Event Details</h3>

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

            <div className="sidebarCard sponsorCard">
              <p>Sponsored Placement</p>
              <h3>Advertise Your Vendor Brand Here</h3>
              <button className="outlineBtn fullWidth">Learn More</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}