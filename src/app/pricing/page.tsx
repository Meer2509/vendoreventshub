
import Link from "next/link";

const plans = [
  {
    name: "Founding Vendor",
    price: "Complimentary",
    sub: "Lifetime founding access",
    badge: "First 80 Vendors",
    remaining: "62 founder spots remaining",
    description:
      "For vendors who want to discover better events, avoid bad booths, save opportunities, and build a trusted public profile.",
    features: [
      "Premium vendor profile",
      "Save events to your dashboard",
      "Leave verified event reviews",
      "Upload logo, banner, and business details",
      "Founding Vendor badge",
      "Early access to Vendor Profit Score",
      "Priority placement in the vendor directory",
    ],
    cta: "Claim Vendor Founder Spot",
    link: "/signup",
    featured: false,
  },
  {
    name: "Founding Organizer",
    price: "Complimentary",
    sub: "Lifetime founding access",
    badge: "First 50 Organizers",
    remaining: "37 organizer spots remaining",
    description:
      "For festivals, fairs, farmers markets, expos, and event organizers who want to attract serious vendors and build trust.",
    features: [
      "Unlimited event listings",
      "Vendor application visibility",
      "Organizer trust profile",
      "Featured founder badge",
      "Promote booth pricing and deadlines",
      "Build reputation with vendor reviews",
      "Lifetime early access benefits",
    ],
    cta: "Claim Organizer Founder Spot",
    link: "/create-event",
    featured: true,
  },
  {
    name: "Premium Ads",
    price: "From $49/mo",
    sub: "Launch revenue plan",
    badge: "Sponsored Growth",
    remaining: "Limited launch placements",
    description:
      "Put your event, vendor brand, food truck, service, or local business in front of event-ready vendors and organizers.",
    features: [
      "Homepage sponsored placement",
      "Vendor directory exposure",
      "Event page visibility",
      "Sponsored business badge",
      "Premium ad image upload",
      "Category and city sponsorships coming soon",
      "Designed for high-intent local traffic",
    ],
    cta: "Advertise Now",
    link: "/advertise",
    featured: false,
  },
];

const whyJoin = [
  {
    title: "Avoid Bad Booths",
    text: "Help vendors make smarter booking decisions before they spend money on a table or tent.",
  },
  {
    title: "Build Reputation",
    text: "Give vendors and organizers a trusted profile that becomes stronger over time.",
  },
  {
    title: "Increase ROI",
    text: "Focus on events with better traffic, stronger fit, and better vendor opportunity.",
  },
  {
    title: "Get Priority",
    text: "Founder profiles can receive stronger visibility as the marketplace grows.",
  },
];

export default function PricingPage() {
  return (
    <main className="vePricingPage">
      <section className="vePricingHero">
        <div>
          <p className="vePricingEyebrow">Founding Member Launch</p>
          <h1>Become a founding member of America’s vendor event intelligence platform.</h1>
          <p className="vePricingText">
            VendorEventsHub helps vendors discover better events, avoid bad booths,
            compare organizer reputation, and grow with smarter event decisions.
            Early vendors and organizers receive complimentary founding access before
            premium plans begin.
          </p>

          <div className="vePricingActions">
            <Link href="/signup" className="veGoldBtn">
              Claim Free Vendor Spot
            </Link>
            <Link href="/create-event" className="veOutlineBtn">
              Claim Organizer Spot
            </Link>
          </div>

          <div className="veTrustRow">
            <span>80 Vendor Spots</span>
            <span>50 Organizer Spots</span>
            <span>Founder Badge</span>
          </div>
        </div>

        <div className="vePricingPanel">
          <p className="vePricingEyebrow">Limited Access</p>
          <h3>Founder spots are designed to build the first trusted vendor network.</h3>

          <div className="veStatsGrid">
            <div>
              <strong>80</strong>
              <span>Vendor founder spots</span>
            </div>
            <div>
              <strong>50</strong>
              <span>Organizer founder spots</span>
            </div>
            <div>
              <strong>$49</strong>
              <span>Premium ads start</span>
            </div>
            <div>
              <strong>ROI</strong>
              <span>Vendor intelligence</span>
            </div>
          </div>
        </div>
      </section>

      <section className="vePricingSection">
        <div className="vePricingHeader">
          <p className="vePricingEyebrow">Launch Pricing</p>
          <h2>Join early. Build trust first. Grow before premium pricing begins.</h2>
        </div>

        <div className="vePricingGrid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "vePricingCard vePricingCardFeatured"
                  : "vePricingCard"
              }
            >
              <p className="vePlanBadge">{plan.badge}</p>
              <h3>{plan.name}</h3>
              <h2>{plan.price}</h2>
              <p className="vePlanSub">{plan.sub}</p>
              <p className="vePlanDescription">{plan.description}</p>
              <div className="veRemaining">{plan.remaining}</div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <Link href={plan.link} className="veGoldBtn">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="vePricingSection">
        <div className="vePricingHeader">
          <p className="vePricingEyebrow">Why Join Early</p>
          <h2>Founding members get the advantage before the platform becomes crowded.</h2>
        </div>

        <div className="veWhyGrid">
          {whyJoin.map((item) => (
            <div className="veWhyCard" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="vePricingSection">
        <div className="veFinalCta">
          <p className="vePricingEyebrow">Founder Access Is Open</p>
          <h2>Join before VendorEventsHub becomes the standard for vendor event decisions.</h2>
          <p>
            The first vendors and organizers help shape the platform, build early
            reputation, and receive founding access before premium memberships begin.
          </p>
          <div className="vePricingActions" style={{ justifyContent: "center" }}>
            <Link href="/signup" className="veGoldBtn">
              Claim Vendor Spot
            </Link>
            <Link href="/create-event" className="veOutlineBtn">
              Claim Organizer Spot
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
