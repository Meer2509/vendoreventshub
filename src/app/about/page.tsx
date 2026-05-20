"use client";

const audiences = [
  "Craft Vendors",
  "Food Trucks",
  "Farmers Market Sellers",
  "Flea Market Vendors",
  "Wellness Brands",
  "Artisan Businesses",
  "Festival Organizers",
  "Local Advertisers",
];

const comparisonPoints = [
  "Booth fees and setup details",
  "Expected traffic and audience fit",
  "Organizer reputation and communication",
  "Real vendor reviews and event experience",
  "Vendor Score™ and opportunity signals",
  "Premium advertising visibility",
];

export default function AboutPage() {
  return (
    <main className="aboutPage">
      <section className="hero">
        <div>
          <p className="eyebrow">About VendorEventsHub</p>
          <h1>Building America’s trusted vendor event intelligence platform.</h1>
          <p className="heroText">
            VendorEventsHub was created to help vendors, organizers, and local
            businesses make smarter event decisions with better visibility,
            trusted information, and premium discovery tools.
          </p>

          <div className="heroActions">
            <button onClick={() => (window.location.href = "/events")}>
              Explore Events
            </button>
            <button
              className="secondary"
              onClick={() => (window.location.href = "/create-event")}
            >
              List Your Event
            </button>
          </div>

          <div className="trustRow">
            <span>Vendor Intelligence</span>
            <span>Organizer Trust</span>
            <span>Event Discovery</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Our Mission</p>
          <h3>Make vendor events more transparent, trusted, and valuable.</h3>
          <p>
            Vendors should not have to guess whether an event is worth the booth
            fee, travel, setup time, and inventory. VendorEventsHub is designed
            to help businesses compare opportunities before they commit.
          </p>
        </div>
      </section>

      <section className="statement">
        <p className="eyebrow">Why We Exist</p>
        <h2>The vendor event industry is huge — but still too fragmented.</h2>
        <p>
          Across America, vendors search through Facebook posts, old websites,
          screenshots, word-of-mouth, and scattered event listings just to find
          where to sell next. Organizers work hard to attract vendors, but many
          still lack a modern platform built around trust, visibility, and
          vendor decision-making.
        </p>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">The Problem We Solve</p>
          <h2>One event can help a vendor grow — or cost them hundreds.</h2>
        </div>

        <div className="problemGrid">
          <div>
            <span>01</span>
            <h3>Vendors need clarity</h3>
            <p>
              Booth fees, traffic quality, audience fit, setup rules, location,
              and organizer communication can completely change the result of an
              event.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>Organizers need visibility</h3>
            <p>
              Great festivals, fairs, farmers markets, expos, and pop-ups need a
              trusted place to reach quality vendors and showcase event details.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>Reviews need purpose</h3>
            <p>
              Vendors do not just need stars. They need meaningful insight:
              traffic, communication, booth value, audience fit, and whether
              other vendors would return.
            </p>
          </div>
        </div>
      </section>

      <section className="solutionBand">
        <div>
          <p className="eyebrow">Our Approach</p>
          <h2>We are building event discovery around trust, data, and vendor experience.</h2>
        </div>

        <div className="solutionGrid">
          <div>
            <strong>Vendor Score™</strong>
            <p>
              A smarter way to understand event opportunity using booth value,
              traffic signals, organizer trust, and vendor feedback.
            </p>
          </div>

          <div>
            <strong>Organizer Reputation</strong>
            <p>
              Organizers can build trust through clear event details,
              communication, visibility, and vendor experiences.
            </p>
          </div>

          <div>
            <strong>Premium Discovery</strong>
            <p>
              Events, vendors, services, and local businesses can use premium
              visibility to reach the right audience at the right time.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">What Vendors Can Compare</p>
          <h2>Better decisions before booking the booth.</h2>
        </div>

        <div className="compareGrid">
          {comparisonPoints.map((item) => (
            <div key={item}>
              <span>✓</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">Who We Serve</p>
          <h2>Built for the full vendor economy.</h2>
        </div>

        <div className="audienceGrid">
          {audiences.map((item) => (
            <button key={item}>
              <span>{item}</span>
              <small>Built for growth</small>
            </button>
          ))}
        </div>
      </section>

      <section className="vision">
        <p className="eyebrow">The Bigger Vision</p>
        <h2>VendorEventsHub can become the trust layer for America’s event economy.</h2>
        <p>
          Our long-term vision is to help vendors find better opportunities,
          help organizers attract stronger businesses, and help local brands
          reach event-ready audiences — all through one modern marketplace built
          around transparency, trust, and smarter decisions.
        </p>

        <div className="visionStats">
          <div>
            <strong>Vendors</strong>
            <span>Discover smarter opportunities</span>
          </div>
          <div>
            <strong>Organizers</strong>
            <span>Reach better-fit vendors</span>
          </div>
          <div>
            <strong>Brands</strong>
            <span>Advertise to event-ready audiences</span>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <p className="eyebrow">Join The Platform</p>
        <h2>Find better events. Build more trust. Grow smarter.</h2>
        <p>
          VendorEventsHub is built for the businesses, organizers, and local
          brands shaping the future of vendor events across America.
        </p>

        <div className="heroActions center">
          <button onClick={() => (window.location.href = "/events")}>
            Explore Events
          </button>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/signup")}
          >
            Create Vendor Account
          </button>
        </div>
      </section>

      <style jsx>{`
        .aboutPage {
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
          padding: 76px 18px;
        }

        .hero {
          min-height: 84vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 36px;
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
          font-size: clamp(48px, 8vw, 92px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
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
        .heroPanel p,
        .statement p,
        .problemGrid p,
        .solutionGrid p,
        .vision p,
        .finalCta p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 760px;
          margin-top: 24px;
        }

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        .center {
          justify-content: center;
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
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.2);
        }

        button.secondary {
          background: rgba(255, 255, 255, 0.55);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
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
        .statement,
        .problemGrid div,
        .solutionBand,
        .compareGrid div,
        .audienceGrid button,
        .vision,
        .finalCta {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
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

        .statement,
        .solutionBand,
        .vision,
        .finalCta {
          text-align: center;
          padding: 76px 28px;
        }

        .statement p,
        .vision p,
        .finalCta p {
          max-width: 820px;
          margin: 24px auto 0;
          font-size: 18px;
        }

        .sectionHead {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .problemGrid,
        .solutionGrid,
        .compareGrid,
        .audienceGrid,
        .visionStats {
          display: grid;
          gap: 18px;
        }

        .problemGrid,
        .solutionGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .compareGrid,
        .audienceGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .visionStats {
          grid-template-columns: repeat(3, 1fr);
          margin-top: 34px;
        }

        .problemGrid div,
        .solutionGrid div,
        .compareGrid div,
        .visionStats div {
          padding: 28px;
          text-align: left;
        }

        .problemGrid span {
          color: #b88a2e;
          font-size: 34px;
          font-weight: 1000;
        }

        .solutionGrid {
          margin-top: 32px;
        }

        .solutionGrid div,
        .visionStats div {
          background: #f7f1e6;
          border-radius: 26px;
        }

        .solutionGrid strong,
        .visionStats strong {
          display: block;
          font-size: 24px;
          letter-spacing: -0.04em;
          margin-bottom: 10px;
        }

        .visionStats span {
          color: #5f6b66;
          line-height: 1.5;
        }

        .compareGrid div {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .compareGrid span {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #10291f;
          color: white;
          font-weight: 950;
          flex: 0 0 auto;
        }

        .audienceGrid button {
          color: #10291f;
          background: rgba(255, 255, 255, 0.86);
          text-align: left;
          padding: 24px;
          border-radius: 26px;
        }

        .audienceGrid span {
          display: block;
          font-size: 20px;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .audienceGrid small {
          color: #5f6b66;
          font-weight: 800;
        }

        @media (max-width: 950px) {
          .hero,
          .problemGrid,
          .solutionGrid,
          .compareGrid,
          .audienceGrid,
          .visionStats {
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
            font-size: 52px;
          }
        }
      `}</style>
    </main>
  );
}