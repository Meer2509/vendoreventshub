"use client";

import Link from "next/link";
import { EVENT_SEO_CATEGORIES } from "@/lib/categories";
import { US_STATES } from "@/lib/locations";
import { SITE_URL } from "@/lib/seo";

const checklist = [
  "Homepage Organization JSON-LD",
  "Event detail Event + Breadcrumb JSON-LD",
  "Vendor & organizer profile Breadcrumb JSON-LD",
  "State & city SEO landing pages",
  "Category SEO landing pages",
  "robots.txt allows public marketplace pages",
  "sitemap.xml includes events, profiles, states, categories",
  "Canonical URLs via NEXT_PUBLIC_SITE_URL",
  "Open Graph + Twitter metadata on key pages",
];

const coreRoutes = [
  "/",
  "/events",
  "/vendors",
  "/about",
  "/pricing",
  "/advertise",
  "/contact",
  "/privacy",
  "/terms",
];

export default function AdminSeoPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">SEO Command</p>
        <h1>Search visibility</h1>
        <p className="adminMuted">
          Monitor public routes, sitemap health, and marketplace indexing readiness.
        </p>
      </section>

      <div className="adminStatsGrid">
        <div className="adminStatCard">
          <p>NEXT_PUBLIC_SITE_URL</p>
          <strong>{siteUrlConfigured ? "Set" : "Default"}</strong>
        </div>
        <div className="adminStatCard">
          <p>Active URL</p>
          <strong style={{ fontSize: 14 }}>{siteUrl}</strong>
        </div>
        <div className="adminStatCard">
          <p>State pages</p>
          <strong>{US_STATES.length}</strong>
        </div>
        <div className="adminStatCard">
          <p>Category pages</p>
          <strong>{EVENT_SEO_CATEGORIES.length}</strong>
        </div>
      </div>

      <section className="adminPanel">
        <h2>SEO checklist</h2>
        <ul className="adminMuted">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="adminPanel">
        <h2>Crawl files</h2>
        <div className="adminToolbar">
          <Link href="/robots.txt" className="adminBtn adminBtnSecondary" target="_blank">
            robots.txt
          </Link>
          <Link href="/sitemap.xml" className="adminBtn adminBtnSecondary" target="_blank">
            sitemap.xml
          </Link>
        </div>
      </section>

      <section className="adminPanel">
        <h2>Core routes</h2>
        <div className="categorySeoGrid">
          {coreRoutes.map((route) => (
            <Link key={route} href={route} className="adminBadge">
              {route}
            </Link>
          ))}
        </div>
      </section>

      <section className="adminPanel">
        <h2>State SEO routes</h2>
        <p className="adminMuted">Public URL → rewrites to /events/state/[state]</p>
        <div className="categorySeoGrid">
          {US_STATES.slice(0, 12).map((state) => (
            <Link key={state.slug} href={`/events/${state.slug}`} className="adminBadge">
              /events/{state.slug}
            </Link>
          ))}
          <span className="adminMuted">+ {US_STATES.length - 12} more in sitemap</span>
        </div>
      </section>

      <section className="adminPanel">
        <h2>Category SEO routes</h2>
        <div className="categorySeoGrid">
          {EVENT_SEO_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/events/category/${cat.slug}`}
              className="adminBadge"
            >
              /events/category/{cat.slug}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
