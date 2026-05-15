import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="luxNav">
      <Link href="/" className="luxBrand">
        VendorEventsHub
      </Link>

      <div className="luxLinks">
        <Link href="/events">Explore</Link>
        <Link href="/vendors">Vendors</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/about">About</Link>
      </div>

      <div className="luxActions">
        <Link href="/login">
          <button className="outlineBtn">Log In</button>
        </Link>

        <Link href="/signup">
          <button className="goldBtn">Join Free</button>
        </Link>
      </div>
    </nav>
  );
}