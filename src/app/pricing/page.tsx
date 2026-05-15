"use client";

const plans = [
  {
    name: "Founding Vendor",
    price: "Free Forever",
    badge: "First 80 Vendors",
    description:
      "For vendors who want to discover better events, save opportunities, and build a trusted business profile.",
    features: [
      "Premium vendor profile",
      "Save events to dashboard",
      "Leave verified reviews",
      "Upload logo and banner",
      "Founding Vendor badge",
      "Early access to new features",
    ],
    cta: "Claim Vendor Spot",
    link: "/signup",
  },
  {
    name: "Founding Organizer",
    price: "Free Forever",
    badge: "First 50 Organizers",
    description:
      "For festivals, fairs, farmers markets, expos, and event organizers who want to attract better vendors.",
    features: [
      "Unlimited event listings",
      "Vendor applications",
      "Approve vendor attendance",
      "Organizer dashboard",
      "Founding Organizer badge",
      "Lifetime premium access",
    ],
    cta: "Claim Organizer Spot",
    link: "/create-event",
  },
  {
    name: "Premium Ads",
    price: "From $49/mo",
    badge: "Launch Revenue Plan",
    description:
      "Promote your vendor brand, festival, service, food truck, or local business directly to event-ready vendors.",
    features: [
      "Homepage sponsored placement",
      "Event page visibility",
      "Vendor directory exposure",
      "Upload premium ad image",
      "Sponsored business badge",
      "More ad tiers coming soon",
    ],
    cta: "Advertise Now",
    link: "/advertise",
  },
];

export default function PricingPage() {
  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">Founding Member Launch</p>
          <h1>Join VendorEventsHub before the premium plans begin.</h1>
          <p className="heroText">
            We are opening VendorEventsHub with a limited Founding Member
            program. The first 80 vendors and first 50 organizers receive
            lifetime free access while we build America’s trusted vendor event
            intelligence platform.
          </p>

          <div className="heroActions">
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/signup")}
            >
              Claim Free Vendor Spot
            </button>

            <button
              className="outlineBtn"
              onClick={() => (window.location.href = "/create-event")}
            >
              Claim Organizer Spot
            </button>
          </div>

          <div className="vhTrustStrip">
            <span>80 Vendor Spots</span>
            <span>50 Organizer Spots</span>
            <span>Free Forever</span>
          </div>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Limited Launch Access</p>
          <h3>Founding members get lifetime access before pricing changes.</h3>

          <div className="vhScoreCard">
            <div>
              <strong>80</strong>
              <span>Vendor spots</span>
            </div>
            <div>
              <strong>50</strong>
              <span>Organizer spots</span>
            </div>
            <div>
              <strong>$49</strong>
              <span>Ads start</span>
            </div>
            <div>
              <strong>Free</strong>
              <span>Founding access</span>
            </div>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Launch Pricing</p>
            <h2>Exclusive access for early vendors and organizers.</h2>
          </div>
        </div>

        <div className="pricingGrid">
          {plans.map((plan) => (
            <article className="pricingCard" key={plan.name}>
              <p className="pricingBadge">{plan.badge}</p>
              <h3>{plan.name}</h3>
              <h2>{plan.price}</h2>
              <p className="muted">{plan.description}</p>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button
                className="goldBtn fullWidth"
                onClick={() => (window.location.href = plan.link)}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="luxSection">
        <div className="premiumCta">
          <p className="goldEyebrow">Coming Later</p>
          <h2>Premium plans will launch after the founding member phase.</h2>
          <p>
            Once the platform grows, VendorEventsHub will introduce Vendor Pro,
            Organizer Pro, featured event boosts, city sponsorships, homepage
            hero placements, and vendor intelligence tools. Founding members
            keep their early access benefits.
          </p>
        </div>
      </section>
    </main>
  );
}