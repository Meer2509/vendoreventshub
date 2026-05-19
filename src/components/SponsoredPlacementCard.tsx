"use client";

export default function SponsoredPlacementCard({ ad }: { ad: any }) {
  return (
    <article className="marketEventCard">
      <div
        className="marketEventImage"
        style={{
          backgroundImage: `url(${
            ad.image_url ||
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
          })`,
        }}
      >
        <span>Sponsored Partner</span>
      </div>

      <div className="marketEventBody">
        <div className="eventDate">Premium Sponsored Placement</div>

        <h3>{ad.ad_title || "Featured VendorEventsHub Partner"}</h3>

        <p className="muted">
          {ad.ad_description ||
            "A premium business promoted through VendorEventsHub."}
        </p>

        <div className="marketStats">
          <span>{ad.business_name || "Sponsored Business"}</span>
          <span>{ad.placement || "Premium Placement"}</span>
          <span>Paid Partner</span>
          <span>30-Day Feature</span>
        </div>

        {ad.link_url && (
          <div className="eventActions">
            <button
              className="fullBtn"
              onClick={() => window.open(ad.link_url, "_blank")}
            >
              Visit Website
            </button>
          </div>
        )}
      </div>
    </article>
  );
}