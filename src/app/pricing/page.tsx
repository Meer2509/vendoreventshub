import Link from "next/link";

const plans = [
  {
    name: "Vendor Account",
    price: "$0",
    sub: "For vendors",
    badge: "Free",
    description:
      "Discover vendor opportunities, compare events, save favorites, leave reviews, and build your vendor profile.",
    features: [
      "Create a vendor profile",
      "Discover festivals, fairs, markets, and expos",
      "Save favorite events",
      "Compare booth fees and traffic signals",
      "Leave vendor reviews",
      "Build trust with organizers",
    ],
    cta: "Create Vendor Account",
    link: "/signup",
    featured: false,
  },
  {
    name: "Organizer Account",
    price: "$0",
    sub: "For event organizers",
    badge: "Free",
    description:
      "List your festival, fair, farmers market, flea market, expo, or pop-up and reach vendors looking for opportunities.",
    features: [
      "List your event",
      "Promote booth details",
      "Share vendor deadlines",
      "Build organizer reputation",
      "Reach vendors searching by category",
      "Show event details in one trusted place",
    ],
    cta: "List Your Event",
    link: "/create-event",
    featured: true,
  },
  {
    name: "Premium Ads",
    price: "From $49",
    sub: "Promote your business",
    badge: "Sponsored",
    description:
      "Advertise your event, vendor service, local business, booth supplies, food truck service, or brand to a vendor-focused audience.",
    features: [
      "Homepage sponsored placement",
      "Premium ad image display",
      "Business description and CTA",
      "Vendor-focused exposure",
      "Great for event services and local businesses",
      "Designed for high-intent traffic",
    ],
    cta: "Advertise Now",
    link: "/advertise",
    featured: false,
  },
  {
    name: "Event Boost",
    price: "From $29",
    sub: "Increase visibility",
    badge: "Boost",
    description:
      "Give your event more exposure so vendors can discover it faster across VendorEventsHub.",
    features: [
      "Featured event visibility",
      "Higher discovery opportunity",
      "Featured badge",
      "More vendor attention",
      "Useful for markets, fairs, festivals, and expos",
      "Simple visibility upgrade",
    ],
    cta: "Boost Your Event",
    link: "/advertise",
    featured: false,
  },
];

const whyAdvertise = [
  {
    title: "Reach Vendors",
    text: "Promote directly to vendors, makers, food businesses, artists, wellness brands, and pop-up sellers.",
  },
  {
    title: "Promote Events",
    text: "Help vendors discover your festival, fair, market, expo, or local event faster.",
  },
  {
    title: "Grow Visibility",
    text: "Use sponsored placements to stand out in a marketplace built for vendor opportunities.",
  },
  {
    title: "Target Intent",
    text: "Your promotion appears where people are already looking for events, booths, and business opportunities.",
  },
];

export default function PricingPage() {
  return (
    <main className="vePricingPage">
      <section className="vePricingHero">
        <div>
          <p className="vePricingEyebrow">VendorEventsHub Pricing</p>
          <h1>Grow faster with premium visibility.</h1>
          <p className="vePricingText">
            VendorEventsHub helps vendors discover better events and helps
            organizers attract the right vendors. Vendor and organizer accounts
            are free. Paid options are available for ads, boosts, and premium
            visibility.
          </p>

          <div className="vePricingActions">
            <Link href="/signup" className="veGoldBtn">
              Create Vendor Account
            </Link>
            <Link href="/create-event" className="veOutlineBtn">
              List Your Event
            </Link>
          </div>

          <div className="veTrustRow">
            <span>Vendor Accounts: Free</span>
            <span>Organizer Accounts: Free</span>
            <span>Ads From $49</span>
          </div>
        </div>

        <div className="vePricingPanel">
          <p className="vePricingEyebrow">Premium Visibility</p>
          <h3>Pay only when you want more exposure.</h3>

          <div className="veStatsGrid">
            <div>
              <strong>$0</strong>
              <span>Vendor account</span>
            </div>
            <div>
              <strong>$0</strong>
              <span>Organizer account</span>
            </div>
            <div>
              <strong>$29+</strong>
              <span>Event boosts</span>
            </div>
            <div>
              <strong>$49+</strong>
              <span>Sponsored ads</span>
            </div>
          </div>
        </div>
      </section>

      <section className="vePricingSection">
        <div className="vePricingHeader">
          <p className="vePricingEyebrow">Simple Pricing</p>
          <h2>Free accounts. Paid visibility when you want to stand out.</h2>
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
          <p className="vePricingEyebrow">Why Promote Here</p>
          <h2>Reach people already searching for vendor opportunities.</h2>
        </div>

        <div className="veWhyGrid">
          {whyAdvertise.map((item) => (
            <div className="veWhyCard" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="vePricingSection">
        <div className="veFinalCta">
          <p className="vePricingEyebrow">Promote Smarter</p>
          <h2>Put your event, business, or brand in front of vendors.</h2>
          <p>
            Use VendorEventsHub to reach vendors, organizers, and local business
            owners looking for fairs, festivals, markets, expos, pop-ups, and
            vendor services.
          </p>
          <div className="vePricingActions" style={{ justifyContent: "center" }}>
            <Link href="/advertise" className="veGoldBtn">
              Advertise Now
            </Link>
            <Link href="/create-event" className="veOutlineBtn">
              List Event Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}