import Link from "next/link";

export default function Footer() {
  return (
    <footer className="luxFooter">
      <div>
        <h2>VendorEventsHub</h2>
        <p>
          The premium vendor intelligence platform for festivals, fairs,
          markets, and business networking.
        </p>
      </div>

      <div className="footerLinks">
        <Link href="/events">Explore Events</Link>
        <Link href="/vendors">Vendors</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
      </div>
    </footer>
  );
}