"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGate from "./AdminGate";

const navLinks = [
  { name: "Command Center", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Vendors", href: "/admin/vendors" },
  { name: "Organizers", href: "/admin/organizers" },
  { name: "Events", href: "/admin/events" },
  { name: "Ads", href: "/admin/ads" },
  { name: "SEO", href: "/admin/seo" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Payments", href: "/admin/payments" },
  { name: "Settings", href: "/admin/settings" },
  { name: "Email Logs", href: "/admin/emails" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGate>
      <div className="adminShell">
        <aside className="adminSidebar">
          <div>
            <p className="adminEyebrow">VendorEventsHub</p>
            <h2 className="adminLogo">Admin God Mode</h2>
            <p className="adminSub">Full marketplace control</p>
          </div>

          <nav className="adminNav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "adminNavLink adminNavLinkActive"
                    : "adminNavLink"
                }
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <Link href="/" className="adminSiteLink">
            ← Back to website
          </Link>
        </aside>

        <main className="adminContent">{children}</main>
      </div>
    </AdminGate>
  );
}
