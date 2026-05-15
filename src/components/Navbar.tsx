"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="luxNavbarWrap">
      <nav className="luxNav">
        <Link href="/" className="luxBrand">
          <div className="brandLogo">
            <span className="brandIcon">V</span>
          </div>

          <div className="brandText">
            <strong>VendorEventsHub</strong>
            <small>Premium Vendor Platform</small>
          </div>
        </Link>

        <div className="luxLinks">
          <Link href="/events">Explore</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/about">About</Link>
        </div>

        <div className="luxActions">
          <Link href="/login">
            <button className="outlineBtn">
              Log In
            </button>
          </Link>

          <Link href="/signup">
            <button className="goldBtn">
              Join Free
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}