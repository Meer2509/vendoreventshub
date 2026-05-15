"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="luxNavbarWrap">
      <nav className="luxNav">
        <Link href="/" className="luxBrand" onClick={() => setOpen(false)}>
          <div className="brandLogo">
            <span className="brandIcon">V</span>
          </div>

          <div className="brandText">
            <strong>VendorEventsHub</strong>
            <small>Premium Vendor Platform</small>
          </div>
        </Link>

        <button
          className="mobileMenuBtn"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`luxMenu ${open ? "open" : ""}`}>
          <div className="luxLinks">
            <Link href="/events" onClick={() => setOpen(false)}>Explore</Link>
            <Link href="/vendors" onClick={() => setOpen(false)}>Vendors</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/advertise" onClick={() => setOpen(false)}>Advertise</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          </div>

          <div className="luxActions">
            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="outlineBtn">Log In</button>
            </Link>

            <Link href="/signup" onClick={() => setOpen(false)}>
              <button className="goldBtn">Join Free</button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}