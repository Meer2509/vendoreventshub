export default function AboutPage() {
  return (
    <main className="luxuryPage">
      <section className="vhHero">
        <div className="vhHeroContent">
          <p className="goldEyebrow">About VendorEventsHub</p>
          <h1>Built to help vendors choose better events.</h1>
          <p className="heroText">
            VendorEventsHub is a premium vendor intelligence platform created
            for vendors, makers, food brands, farmers market sellers, flea
            market businesses, craft show exhibitors, festival vendors, and
            event organizers who want better visibility, trusted information,
            and stronger event results.
          </p>
        </div>

        <div className="vhHeroPanel">
          <p className="panelBadge">Our Mission</p>
          <h3>Make vendor events more transparent, trusted, and profitable.</h3>
          <p className="muted">
            Vendors should not have to guess if an event is worth the booth fee.
            Our platform helps businesses compare opportunities before they
            spend money, travel, and inventory.
          </p>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Why We Exist</p>
            <h2>The vendor event industry needs better information.</h2>
          </div>
        </div>

        <div className="featureGrid">
          <div className="featureBox">
            <span className="stepNumber">01</span>
            <h3>Vendors need clarity</h3>
            <p>
              Booth fees, foot traffic, audience quality, setup details, and
              organizer communication can make or break a vendor’s day.
            </p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">02</span>
            <h3>Organizers need visibility</h3>
            <p>
              Great festivals, fairs, farmers markets, and expos deserve a
              professional platform to attract quality vendors.
            </p>
          </div>

          <div className="featureBox">
            <span className="stepNumber">03</span>
            <h3>Reviews should be trusted</h3>
            <p>
              VendorEventsHub is designed around verified vendor experiences,
              helping reduce fake reviews and low-quality event listings.
            </p>
          </div>
        </div>
      </section>

      <section className="vhProblemSection">
        <p className="goldEyebrow">What We Help Vendors Compare</p>
        <h2>Better decisions before booking the booth.</h2>

        <div className="vhProblemGrid">
          <div className="vhProblemCard">
            <span>✓</span>
            <h3>Booth fees and setup details</h3>
          </div>
          <div className="vhProblemCard">
            <span>✓</span>
            <h3>Expected traffic and audience fit</h3>
          </div>
          <div className="vhProblemCard">
            <span>✓</span>
            <h3>Organizer reputation and communication</h3>
          </div>
          <div className="vhProblemCard">
            <span>✓</span>
            <h3>Real vendor reviews and event experience</h3>
          </div>
        </div>
      </section>

      <section className="luxSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Who It Is For</p>
            <h2>A platform for the full vendor economy.</h2>
          </div>
        </div>

        <div className="categoryLuxuryGrid">
          {[
            "Craft Vendors",
            "Food Trucks",
            "Farmers Market Sellers",
            "Flea Market Vendors",
            "Wellness Brands",
            "Artisan Businesses",
            "Festival Organizers",
            "Local Advertisers",
          ].map((item) => (
            <button key={item}>
              <span>{item}</span>
              <small>Built for growth</small>
            </button>
          ))}
        </div>
      </section>

      <section className="luxSection">
        <div className="premiumCta">
          <p className="goldEyebrow">Our Vision</p>
          <h2>The trusted marketplace for vendor event intelligence.</h2>
          <p>
            Our goal is to become the leading destination where vendors discover
            profitable opportunities, organizers attract better businesses, and
            local brands advertise directly to an event-ready audience.
          </p>

          <div className="heroActions">
            <button
              className="goldBtn"
              onClick={() => (window.location.href = "/events")}
            >
              Explore Events
            </button>

            <button
              className="outlineBtn"
              onClick={() => (window.location.href = "/signup")}
            >
              Join Free
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}