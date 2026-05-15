"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="vhNavWrap">
      <nav className="vhNav">
        <Link href="/" className="vhBrand" onClick={() => setOpen(false)}>
          <span className="vhLogoMark">V</span>
          <span>
            <strong>VendorEventsHub</strong>
            <small>Premium Vendor Platform</small>
          </span>
        </Link>

        <button
          className="vhMenuButton"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className={`vhMenu ${open ? "isOpen" : ""}`}>
          <Link href="/events" onClick={() => setOpen(false)}>Explore</Link>
          <Link href="/vendors" onClick={() => setOpen(false)}>Vendors</Link>
          <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/advertise" onClick={() => setOpen(false)}>Advertise</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>

          <div className="vhMenuActions">
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