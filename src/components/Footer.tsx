import Link from "next/link";
import { US_STATES } from "@/lib/locations";

const launchStates = US_STATES.filter((s) =>
  ["connecticut", "massachusetts", "new-york", "new-jersey", "rhode-island"].includes(
    s.slug
  )
);

export default function Footer() {
  return (
    <footer className="luxFooter">
      <div>
        <h2>VendorEventsHub</h2>
        <p>
          A vendor intelligence platform helping vendors compare festivals,
          fairs, markets, and pop-up events before applying.
        </p>
        <p className="footerTrust">
          Launching in Connecticut — expanding nationwide. Founding vendors and
          organizers welcome.
        </p>
      </div>

      <div className="footerLinks">
        <div>
          <strong>Marketplace</strong>
          <Link href="/events">Explore Events</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/create-event">List Your Event</Link>
          <Link href="/signup">Join Free</Link>
        </div>

        <div>
          <strong>Company</strong>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/advertise">Advertise</Link>
        </div>

        <div>
          <strong>Explore</strong>
          <Link href="/events">Events</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </div>

        <div>
          <strong>Legal</strong>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>

        <div>
          <strong>Events by State</strong>
          {launchStates.map((state) => (
            <Link key={state.slug} href={`/events/${state.slug}`}>
              {state.name}
            </Link>
          ))}
          <Link href="/events">All states →</Link>
        </div>
      </div>
    </footer>
  );
}
