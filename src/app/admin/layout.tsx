import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { name: "Command Center", href: "/admin" },
    { name: "Ads Review", href: "/admin/ads" },
    { name: "Payments", href: "/admin/payments" },
    { name: "Events", href: "/admin/events" },
    { name: "Vendors", href: "/admin/vendors" },
    { name: "Users", href: "/admin/users" },
    { name: "Settings", href: "/admin/settings" },
  ];

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <p style={styles.eyebrow}>VendorEventsHub</p>
          <h2 style={styles.logo}>Admin Panel</h2>
          <p style={styles.sub}>Private command center</p>
        </div>

        <nav style={styles.nav}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={styles.navLink}>
              {link.name}
            </Link>
          ))}
        </nav>

        <Link href="/" style={styles.siteLink}>
          ← Back to website
        </Link>
      </aside>

      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    minHeight: "100vh",
    background: "#f7f3ea",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "#10291f",
    color: "#fff",
    padding: 26,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#e8ddc7",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".16em",
    margin: 0,
  },
  logo: {
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-.05em",
    margin: "10px 0",
  },
  sub: {
    color: "rgba(255,255,255,.65)",
    margin: 0,
  },
  nav: {
    display: "grid",
    gap: 10,
    marginTop: 30,
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: "14px 16px",
    fontWeight: 800,
  },
  siteLink: {
    color: "#e8ddc7",
    textDecoration: "none",
    fontWeight: 900,
  },
  content: {
    minWidth: 0,
  },
};