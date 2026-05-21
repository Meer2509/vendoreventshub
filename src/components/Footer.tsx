import Link from "next/link";

const marketplaceLinks = [
  { label: "Explore Events", href: "/events" },
  { label: "Vendors", href: "/vendors" },
  { label: "List Your Event", href: "/create-event" },
  { label: "Join Free", href: "/signup" },
];

const vendorLinks = [
  { label: "Find Events", href: "/events" },
  { label: "Create Vendor Profile", href: "/profile/setup" },
  { label: "Vendor Login", href: "/login/vendor" },
  { label: "Saved Events", href: "/dashboard/vendor" },
];

const organizerLinks = [
  { label: "List Event", href: "/create-event" },
  { label: "Organizer Profile", href: "/dashboard/organizer/setup" },
  { label: "Organizer Login", href: "/login/organizer" },
  { label: "Advertise", href: "/advertise" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const popularSearches = [
  { label: "Vendor Events Near Me", href: "/events" },
  {
    label: "Craft Fairs Looking for Vendors",
    href: "/events/category/craft-fairs",
  },
  {
    label: "Farmers Markets Looking for Vendors",
    href: "/events/category/farmers-markets",
  },
  {
    label: "Flea Markets Accepting Vendors",
    href: "/events/category/flea-markets",
  },
  { label: "Vendor Events in Connecticut", href: "/events/connecticut" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="vehFooterCol">
      <h3 className="vehFooterColTitle">{title}</h3>
      <ul className="vehFooterList">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="vehFooter" aria-label="Site footer">
      <div className="vehFooterShell">
        <div className="vehFooterMain">
          <div className="vehFooterBrand">
            <Link href="/" className="vehFooterBrandLink">
              <span className="vehFooterMark" aria-hidden>
                V
              </span>
              <span className="vehFooterBrandText">
                <strong>VendorEventsHub</strong>
                <small>Premium Vendor Platform</small>
              </span>
            </Link>
            <p className="vehFooterDesc">
              A vendor intelligence platform helping vendors compare festivals,
              fairs, markets, and pop-up events before applying.
            </p>
          </div>

          <div className="vehFooterGrid">
            <FooterColumn title="Marketplace" links={marketplaceLinks} />
            <FooterColumn title="For Vendors" links={vendorLinks} />
            <FooterColumn title="For Organizers" links={organizerLinks} />
            <FooterColumn title="Company" links={companyLinks} />
          </div>
        </div>

        <div className="vehFooterPopular">
          <h3 className="vehFooterColTitle">Popular Searches</h3>
          <div className="vehFooterPopularLinks">
            {popularSearches.map((link) => (
              <Link key={link.href} href={link.href} className="vehFooterChip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="vehFooterBottom">
          <p className="vehFooterCopy">
            © {year} VendorEventsHub. All rights reserved.
          </p>
          <p className="vehFooterLaunch">
            Launching in Connecticut — expanding nationwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
