"use client";
import Link from "next/link";

const freePlans = [
  {
    name: "Vendor Account",
    price: "$0",
    badge: "Vendor Access",
    description:
      "Create your vendor profile, discover events, compare opportunities, save favorites, and build trust through reviews.",
    cta: "Create Vendor Account",
    link: "/signup",
    features: [
      "Vendor profile",
      "Event discovery",
      "Saved opportunities",
      "Vendor reviews",
      "Booth fee comparison",
      "Traffic and opportunity signals",
    ],
  },
  {
    name: "Organizer Account",
    price: "$0",
    badge: "Organizer Access",
    description:
      "List your festival, fair, market, expo, pop-up, or vendor event and connect with vendors looking for opportunities.",
    cta: "List Your Event",
    link: "/create-event",
    features: [
      "Event listing",
      "Booth details",
      "Vendor deadlines",
      "Organizer reputation",
      "Event visibility",
      "Vendor discovery",
    ],
  },
];

const adPlans = [
  {
    name: "Vendor Directory Feature",
    price: "$49",
    duration: "30 Days",
    badge: "Directory",
    description:
      "Feature your vendor business in the vendor directory for stronger visibility.",
    priceId: "price_1TYtAoCd2ATbUlJglTQSZSl9",
  },
  {
    name: "Event Detail Sidebar Ad",
    price: "$79",
    duration: "30 Days",
    badge: "Sidebar",
    description:
      "Promote your business beside event detail pages where vendors are researching opportunities.",
    priceId: "price_1TYt7FCd2ATbUlJgIAJsPSgu",
  },
  {
    name: "Events Page Sponsored Card",
    price: "$99",
    duration: "30 Days",
    badge: "Sponsored",
    description:
      "Place your sponsored card on the events page where vendors browse opportunities.",
    priceId: "price_1TYt6lCd2ATbUlJgNx9R2TS4",
    featured: true,
  },
  {
    name: "Dashboard Premium Ad",
    price: "$149",
    duration: "30 Days",
    badge: "Dashboard",
    description:
      "Reach logged-in users inside the dashboard with premium business exposure.",
    priceId: "price_1TYt7pCd2ATbUlJgSjcwbtSx",
  },
  {
    name: "Homepage Premium Ad",
    price: "$249",
    duration: "30 Days",
    badge: "Homepage",
    description:
      "Show your premium ad directly on the homepage below the hero section.",
    priceId: "price_1TYt3yCd2ATbUlJgUDIbjMXm",
    featured: true,
  },
  {
    name: "Category Sponsor Premium",
    price: "$299",
    duration: "30 Days",
    badge: "Category Sponsor",
    description:
      "Own premium visibility inside a category such as festivals, fairs, markets, food, wellness, or expos.",
    priceId: "price_1TYtBPCd2ATbUlJgL2DsS3D7",
  },
];

const benefits = [
  "Reach vendors actively searching for events",
  "Promote festivals, fairs, markets, expos, and services",
  "Advertise booth supplies, insurance, POS, signage, food services, and local businesses",
  "Stand out with premium visibility across VendorEventsHub",
];

export default function PricingPage() {
  return (
    <main className="pricingPage">
      <section className="pricingHero">
        <div>
          <p className="eyebrow">VendorEventsHub Pricing</p>
          <h1>Premium visibility for events, vendors, and local businesses.</h1>
          <p className="heroText">
            Vendor and organizer accounts are free. Paid options are designed
            for businesses, events, and brands that want more exposure across
            VendorEventsHub.
          </p>

          <div className="actions">
            <Link href="/signup">Create Vendor Account</Link>
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
          <p className="eyebrow">Advertising Menu</p>
          <h3>Pay only for premium exposure.</h3>

          <div className="statGrid">
            <div>
              <strong>$49</strong>
              <span>Directory Feature</span>
            </div>
            <div>
              <strong>$99</strong>
              <span>Sponsored Card</span>
            </div>
            <div>
              <strong>$249</strong>
              <span>Homepage Ad</span>
            </div>
            <div>
              <strong>$299</strong>
              <span>Category Sponsor</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <p className="eyebrow">Core Platform</p>
          <h2>Simple access for vendors and organizers.</h2>
        </div>

        <div className="freeGrid">
          {freePlans.map((plan) => (
            <article className="freeCard" key={plan.name}>
              <p className="badge">{plan.badge}</p>
              <h3>{plan.name}</h3>
              <h2>{plan.price}</h2>
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
        <div className="sectionHeader">
          <p className="eyebrow">Premium Advertising</p>
          <h2>Choose the placement that matches your growth goal.</h2>
        </div>

        <div className="adGrid">
          {adPlans.map((plan) => (
            <article
              className={plan.featured ? "adCard featured" : "adCard"}
              key={plan.name}
            >
              <p className="badge">{plan.badge}</p>
              <h3>{plan.name}</h3>
              <div className="priceLine">
                <h2>{plan.price}</h2>
                <span>/ {plan.duration}</span>
              </div>
              <p>{plan.description}</p>

              <Link href={`/advertise?price=${plan.priceId}`}>
                Advertise Now
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="benefitSection">
        <p className="eyebrow">Why Advertise Here</p>
        <h2>Reach people already looking for vendor opportunities.</h2>

        <div className="benefitGrid">
          {benefits.map((item) => (
            <div key={item}>
              <span>✓</span>
              <p>{item}</p>
            </div>
          ))}
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
          background: #f7f1e6;
          color: #10291f;
          overflow: hidden;
        }

        section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 78px 18px;
        }

        .pricingHero {
          min-height: 82vh;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          align-items: center;
          gap: 34px;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        h1 {
          font-size: clamp(46px, 7vw, 86px);
          line-height: 0.9;
          letter-spacing: -0.07em;
          margin: 0;
        }

        h2 {
          font-size: clamp(34px, 5vw, 62px);
          line-height: 0.95;
          letter-spacing: -0.06em;
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
          max-width: 720px;
          margin: 22px 0 0;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .actions a,
        .freeCard a,
        .adCard a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #10291f;
          color: white;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 900;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .actions a:hover,
        .freeCard a:hover,
        .adCard a:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(16, 41, 31, 0.18);
        }

        .actions a.secondary {
          background: transparent;
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
          margin-top: 28px;
        }

        .trustRow span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .freeCard,
        .adCard,
        .benefitSection,
        .finalCta {
          background: white;
          border: 1px solid #eadfc9;
          border-radius: 34px;
          box-shadow: 0 28px 80px rgba(20, 88, 63, 0.12);
        }

        .heroPanel {
          padding: 34px;
        }

        .statGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 26px;
        }

        .statGrid div {
          background: #f7f1e6;
          border-radius: 22px;
          padding: 18px;
        }

        .statGrid strong {
          display: block;
          font-size: 34px;
          letter-spacing: -0.05em;
        }

        .statGrid span {
          color: #5f6b66;
          font-size: 14px;
        }

        .sectionHeader {
          max-width: 820px;
          margin-bottom: 28px;
        }

        .freeGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .adGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .freeCard,
        .adCard {
          padding: 28px;
          position: relative;
        }

        .adCard.featured {
          background: #10291f;
          color: white;
          border-color: #10291f;
        }

        .adCard.featured p,
        .adCard.featured .priceLine span,
        .adCard.featured li {
          color: rgba(255, 255, 255, 0.78);
        }

        .adCard.featured a {
          background: #b88a2e;
        }

        .badge {
          display: inline-flex;
          background: #f7f1e6;
          color: #10291f;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 18px;
        }

        .adCard.featured .badge {
          background: white;
          color: #10291f;
        }

        .freeCard h2,
        .adCard h2 {
          font-size: 48px;
          margin-top: 16px;
        }

        .freeCard p,
        .adCard p {
          color: #5f6b66;
          line-height: 1.65;
        }

        .priceLine {
          display: flex;
          align-items: end;
          gap: 8px;
          margin-top: 14px;
        }

        .priceLine span {
          color: #5f6b66;
          margin-bottom: 8px;
          font-weight: 800;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 22px 0;
          display: grid;
          gap: 11px;
        }

        li {
          color: #40534b;
          font-weight: 750;
          line-height: 1.5;
        }

        .freeCard a,
        .adCard a {
          width: 100%;
          margin-top: 8px;
        }

        .benefitSection,
        .finalCta {
          text-align: center;
          padding: 70px 28px;
        }

        .benefitGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 30px;
        }

        .benefitGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 22px;
        }

        .benefitGrid span {
          color: #b88a2e;
          font-size: 26px;
          font-weight: 1000;
        }

        .benefitGrid p {
          color: #40534b;
          font-weight: 800;
          line-height: 1.55;
        }

        .finalCta p {
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 920px) {
          .pricingHero,
          .freeGrid,
          .adGrid,
          .benefitGrid {
            grid-template-columns: 1fr;
          }

          section {
            padding: 54px 16px;
          }

          .pricingHero {
            min-height: auto;
            padding-top: 42px;
          }

          h1 {
            font-size: 50px;
          }

          .statGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}