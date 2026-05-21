"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearProfileRoleCache, getAuthSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AdminGate from "./AdminGate";

const navLinks = [
  { name: "Overview", href: "/admin" },
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

  async function logout() {
    const { user } = await getAuthSession();
    if (user?.id) clearProfileRoleCache(user.id);
    else clearProfileRoleCache();

    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AdminGate>
      <div className="adminShell">
        <aside className="adminSidebar">
          <header className="adminSidebarHeader">
            <p className="adminEyebrow">VendorEventsHub</p>
            <h2 className="adminLogo">Admin</h2>
            <p className="adminSub">Marketplace operations</p>
          </header>

          <nav className="adminNav" aria-label="Admin navigation">
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

          <footer className="adminSidebarFooter">
            <Link href="/" className="adminBackBtn">
              Back to Website
            </Link>
            <button type="button" className="adminLogoutBtn" onClick={logout}>
              Log Out
            </button>
          </footer>
        </aside>

        <main className="adminContent">{children}</main>
      </div>
    </AdminGate>
  );
}
