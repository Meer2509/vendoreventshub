"use client";

import Link from "next/link";

const accessPlans = [
  {
    name: "Vendor Account",
    price: "$0",
    eyebrow: "For vendors",
    description:
      "Discover better events, compare opportunities, save favorites, leave reviews, and build a trusted vendor profile.",
    cta: "Create Vendor Account",
    link: "/signup",
    features: [
      "Vendor profile",
      "Save favorite events",
      "Compare booth fees",
      "Review event experiences",
      "Discover festivals, fairs, markets, and expos",
    ],
  },
  {
    name: "Organizer Account",
    price: "$0",
    eyebrow: "For organizers",
    description:
      "List your festival, market, fair, expo, or pop-up and reach vendors actively looking for opportunities.",
    cta: "List Your Event",
    link: "/create-event",
    features: [
      "Event listings",
      "Booth details",
      "Vendor deadlines",
      "Organizer reputation",
      "Visibility to vendor businesses",
    ],
  },
];

const adPlans = [
  {
    name: "Vendor Directory Feature",
    price: "$49",
    duration: "30 Days",
    badge: "Entry Visibility",
    description:
      "Feature your vendor business inside the vendor directory for stronger discovery.",
    bestFor: ["Vendor brands", "Local businesses", "Service providers"],
    priceId: "price_1TYtAoCd2ATbUlJglTQSZSl9",
  },
  {
    name: "Event Detail Sidebar Ad",
    price: "$79",
    duration: "30 Days",
    badge: "Event Research",
    description:
      "Appear beside event detail pages while vendors are researching opportunities.",
    bestFor: ["Booth services", "Supplies", "Local sponsors"],
    priceId: "price_1TYt7FCd2ATbUlJgIAJsPSgu",
  },
  {
    name: "Events Page Sponsored Card",
    price: "$99",
    duration: "30 Days",
    badge: "High Intent",
    description:
      "Place your sponsored card on the events page where vendors browse listings.",
    bestFor: ["Festivals", "Markets", "Expos"],
    priceId: "price_1TYt6lCd2ATbUlJgNx9R2TS4",
  },
  {
    name: "Dashboard Premium Ad",
    price: "$149",
    duration: "30 Days",
    badge: "Logged-In Reach",
    description:
      "Reach users inside the dashboard with premium placement and strong visibility.",
    bestFor: ["Vendor services", "Business tools", "Event services"],
    priceId: "price_1TYt7pCd2ATbUlJgSjcwbtSx",
  },
  {
    name: "Homepage Premium Ad",
    price: "$249",
    duration: "30 Days",
    badge: "Most Popular",
    description:
      "Show your premium ad directly on the homepage below the hero section.",
    bestFor: ["Brand awareness", "Events", "Premium sponsors"],
    priceId: "price_1TYt3yCd2ATbUlJgUDIbjMXm",
    featured: true,
  },
  {
    name: "Category Sponsor Premium",
    price: "$299",
    duration: "30 Days",
    badge: "Premium Sponsor",
    description:
      "Own premium visibility inside a category such as festivals, markets, food, wellness, or expos.",
    bestFor: ["Category leaders", "Regional sponsors", "Major events"],
    priceId: "price_1TYtBPCd2ATbUlJgL2DsS3D7",
    premium: true,
  },
];

const audience = [
  "Festivals",
  "Craft Fairs",
  "Flea Markets",
  "Farmers Markets",
  "Food Events",
  "Expos",
  "Pop-Ups",
  "Wellness Events",
];

export default function PricingPage() {
  return (
    <main className="pricingPage">
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">VendorEventsHub Pricing</p>
          <h1>Reach more vendors. Grow smarter.</h1>
          <p className="heroText">
            Promote your event, business, or brand directly to vendors actively
            searching for festivals, fairs, flea markets, expos, pop-ups, and
            vendor opportunities across America.
          </p>

          <div className="actions">
            <Link href="/advertise">Advertise Now</Link>
            <Link href="/create-event" className="secondary">
              List Your Event
            </Link>
          </div>

          <div className="trustRow">
            <span>Vendor Accounts: $0</span>
            <span>Organizer Accounts: $0</span>
            <span>Premium Ads From $49</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="eyebrow">Premium Visibility Menu</p>
          <h3>Pay only when you want more exposure.</h3>

          <div className="panelPrice">
            <span>Starting at</span>
            <strong>$49</strong>
            <small>30-day advertising placements</small>
          </div>

          <div className="miniStats">
            <div>
              <strong>$99</strong>
              <span>Events Page</span>
            </div>
            <div>
              <strong>$249</strong>
              <span>Homepage</span>
            </div>
            <div>
              <strong>$299</strong>
              <span>Category Sponsor</span>
            </div>
          </div>
        </div>
      </section>

      <section className="audienceStrip">
        <p>Built to reach vendors searching across:</p>
        <div>
          {audience.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">Core Platform</p>
          <h2>Simple access for vendors and organizers.</h2>
        </div>

        <div className="accessGrid">
          {accessPlans.map((plan) => (
            <article className="accessCard" key={plan.name}>
              <p className="cardEyebrow">{plan.eyebrow}</p>
              <h3>{plan.name}</h3>
              <h4>{plan.price}</h4>
              <p>{plan.description}</p>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <Link href={plan.link}>{plan.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">Premium Advertising</p>
          <h2>Choose the placement that matches your growth goal.</h2>
        </div>

        <div className="adGrid">
          {adPlans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "adCard",
                plan.featured ? "featured" : "",
                plan.premium ? "premium" : "",
              ].join(" ")}
            >
              <div className="badgeRow">
                <span>{plan.badge}</span>
                {plan.featured && <strong>Recommended</strong>}
              </div>

              <h3>{plan.name}</h3>

              <div className="price">
                <strong>{plan.price}</strong>
                <span>/ {plan.duration}</span>
              </div>

              <p>{plan.description}</p>

              <div className="bestFor">
                <small>Best for</small>
                {plan.bestFor.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </div>

              <Link href={`/advertise?price=${plan.priceId}`}>
                Select Placement
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="luxuryBand">
        <div>
          <p className="eyebrow">Why Advertise Here</p>
          <h2>Visibility where vendor intent is already happening.</h2>
        </div>

        <div className="benefits">
          <div>
            <strong>01</strong>
            <h3>Reach high-intent vendors</h3>
            <p>
              Your promotion appears where vendors are already searching for
              booths, events, markets, and business opportunities.
            </p>
          </div>
          <div>
            <strong>02</strong>
            <h3>Promote more than events</h3>
            <p>
              Great for booth supplies, signage, insurance, POS systems,
              marketing services, food services, and local sponsors.
            </p>
          </div>
          <div>
            <strong>03</strong>
            <h3>Stand out with premium placement</h3>
            <p>
              Sponsored visibility helps your business rise above ordinary
              listings and reach users with stronger purchase intent.
            </p>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <p className="eyebrow">Promote Smarter</p>
        <h2>Put your event, business, or brand in front of vendors.</h2>
        <p>
          VendorEventsHub is built for event discovery, vendor growth, organizer
          trust, and premium advertising visibility.
        </p>

        <div className="actions center">
          <Link href="/advertise">Advertise Now</Link>
          <Link href="/create-event" className="secondary">
            List Your Event
          </Link>
        </div>
      </section>

      <style jsx>{`
        .pricingPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
          overflow: hidden;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 78px 18px;
        }

        .hero {
          min-height: 84vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 36px;
        }

        .eyebrow,
        .cardEyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        h1 {
          font-size: clamp(50px, 8vw, 96px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
          max-width: 850px;
        }

        h2 {
          font-size: clamp(36px, 5vw, 66px);
          line-height: 0.94;
          letter-spacing: -0.065em;
          margin: 0;
        }

        h3 {
          font-size: 25px;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .heroText,
        .finalCta p {
          color: #5f6b66;
          font-size: 18px;
          line-height: 1.75;
          max-width: 740px;
          margin: 24px 0 0;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        .actions a,
        .accessCard a,
        .adCard a {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          background: #10291f;
          color: white;
          padding: 15px 24px;
          border-radius: 999px;
          font-weight: 950;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .actions a:hover,
        .accessCard a:hover,
        .adCard a:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.2);
        }

        .actions a.secondary {
          background: rgba(255, 255, 255, 0.55);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .center {
          justify-content: center;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }

        .trustRow span,
        .audienceStrip span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .accessCard,
        .adCard,
        .luxuryBand,
        .finalCta,
        .audienceStrip {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
          position: relative;
          overflow: hidden;
        }

        .heroPanel:before {
          content: "";
          position: absolute;
          inset: -90px -80px auto auto;
          width: 230px;
          height: 230px;
          border-radius: 999px;
          background: rgba(184, 138, 46, 0.18);
        }

        .panelPrice {
          background: #10291f;
          color: white;
          border-radius: 30px;
          padding: 28px;
          margin-top: 26px;
        }

        .panelPrice span,
        .panelPrice small {
          display: block;
          color: rgba(255, 255, 255, 0.72);
          font-weight: 800;
        }

        .panelPrice strong {
          display: block;
          font-size: 78px;
          letter-spacing: -0.08em;
          line-height: 0.95;
          margin: 8px 0;
        }

        .miniStats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 12px;
        }

        .miniStats div {
          background: #f7f1e6;
          border-radius: 22px;
          padding: 16px;
        }

        .miniStats strong {
          display: block;
          font-size: 28px;
          letter-spacing: -0.05em;
        }

        .miniStats span {
          color: #5f6b66;
          font-size: 13px;
          font-weight: 800;
        }

        .audienceStrip {
          padding: 28px;
          margin-top: -34px;
        }

        .audienceStrip p {
          margin: 0 0 16px;
          color: #5f6b66;
          font-weight: 850;
        }

        .audienceStrip div {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .sectionHead {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .accessGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .accessCard {
          padding: 32px;
        }

        .accessCard h4 {
          font-size: 58px;
          letter-spacing: -0.07em;
          line-height: 1;
          margin: 18px 0;
        }

        .accessCard p,
        .adCard p,
        .luxuryBand p {
          color: #5f6b66;
          line-height: 1.65;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          display: grid;
          gap: 11px;
        }

        li {
          color: #40534b;
          font-weight: 780;
          line-height: 1.5;
        }

        .accessCard a,
        .adCard a {
          width: 100%;
          margin-top: 8px;
        }

        .adGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .adCard {
          padding: 28px;
          position: relative;
          overflow: hidden;
        }

        .adCard.featured {
          background: #10291f;
          color: white;
          border-color: #10291f;
          transform: translateY(-8px);
        }

        .adCard.premium {
          background: linear-gradient(145deg, #10291f, #1f4f3c);
          color: white;
          border-color: rgba(184, 138, 46, 0.55);
        }

        .adCard.featured p,
        .adCard.premium p,
        .adCard.featured .price span,
        .adCard.premium .price span {
          color: rgba(255, 255, 255, 0.76);
        }

        .adCard.featured a,
        .adCard.premium a {
          background: #b88a2e;
        }

        .badgeRow {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 18px;
        }

        .badgeRow span,
        .badgeRow strong {
          background: #f7f1e6;
          color: #10291f;
          border-radius: 999px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .badgeRow strong {
          background: #b88a2e;
          color: white;
        }

        .price {
          display: flex;
          align-items: end;
          gap: 8px;
          margin: 18px 0;
        }

        .price strong {
          font-size: 58px;
          letter-spacing: -0.08em;
          line-height: 1;
        }

        .price span {
          color: #5f6b66;
          font-weight: 850;
          margin-bottom: 8px;
        }

        .bestFor {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 22px 0;
        }

        .bestFor small {
          width: 100%;
          color: #b88a2e;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .bestFor em {
          font-style: normal;
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 850;
        }

        .adCard.featured .bestFor em,
        .adCard.premium .bestFor em {
          border-color: rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.88);
        }

        .luxuryBand {
          padding: 70px 28px;
        }

        .benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }

        .benefits div {
          background: #f7f1e6;
          border-radius: 26px;
          padding: 24px;
        }

        .benefits strong {
          color: #b88a2e;
          font-size: 30px;
          font-weight: 1000;
        }

        .finalCta {
          text-align: center;
          padding: 76px 28px;
          margin-bottom: 70px;
        }

        .finalCta p {
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 980px) {
          .hero,
          .accessGrid,
          .adGrid,
          .benefits {
            grid-template-columns: 1fr;
          }

          section {
            padding: 54px 16px;
          }

          .hero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 54px;
          }

          .miniStats {
            grid-template-columns: 1fr;
          }

          .adCard.featured {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}