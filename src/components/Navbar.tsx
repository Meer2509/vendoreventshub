"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  dashboardPathForRole,
  getAuthUser,
  getProfileRole,
} from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    async function resolveDashboard() {
      const { user } = await getAuthUser();
      if (!user) {
        setDashboardHref(null);
        return;
      }

      const role = await getProfileRole(user.id);
      setDashboardHref(dashboardPathForRole(role));
    }

    resolveDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      resolveDashboard();
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Link href="/events" onClick={() => setOpen(false)}>Events</Link>
          <Link href="/vendors" onClick={() => setOpen(false)}>Vendors</Link>
          <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/advertise" onClick={() => setOpen(false)}>Advertise</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>

          <div className="vhMenuActions">
            {dashboardHref ? (
              <Link href={dashboardHref} onClick={() => setOpen(false)}>
                <button className="outlineBtn">Dashboard</button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                <button className="outlineBtn">Log In</button>
              </Link>
            )}

            {!dashboardHref && (
              <Link href="/signup" onClick={() => setOpen(false)}>
                <button className="goldBtn">Join Free</button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
