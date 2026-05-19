"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminUsersPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [vendors, setVendors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [adOrders, setAdOrders] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      if (!ADMIN_EMAILS.includes(data.user.email || "")) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      const [
        { data: vendorRows },
        { data: eventRows },
        { data: adRows },
      ] = await Promise.all([
        supabase
          .from("vendor_profiles")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("ad_orders")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      setVendors(vendorRows || []);
      setEvents(eventRows || []);
      setAdOrders(adRows || []);

      setLoading(false);
    }

    init();
  }, []);

  const stats = useMemo(() => {
    const verifiedVendors = vendors.filter(
      (v) => v.verified
    ).length;

    const featuredVendors = vendors.filter(
      (v) => v.featured
    ).length;

    const verifiedOrganizers = events.filter(
      (e) => e.verified_organizer
    ).length;

    const paidAdvertisers = adOrders.filter(
      (a) => a.payment_status === "paid"
    ).length;

    return {
      verifiedVendors,
      featuredVendors,
      verifiedOrganizers,
      paidAdvertisers,
    };
  }, [vendors, events, adOrders]);

  if (loading) {
    return (
      <main style={styles.page}>
        Loading platform users...
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={styles.page}>
        Access denied.
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>
          VendorEventsHub Admin
        </p>

        <h1 style={styles.title}>
          Platform Users Intelligence
        </h1>

        <p style={styles.text}>
          Review vendors, organizers,
          advertisers, and business activity
          across VendorEventsHub.
        </p>
      </section>

      <section style={styles.statsGrid}>
        <Stat
          title="Vendor Profiles"
          value={vendors.length}
        />
        <Stat
          title="Verified Vendors"
          value={stats.verifiedVendors}
        />
        <Stat
          title="Featured Vendors"
          value={stats.featuredVendors}
        />
        <Stat
          title="Event Organizers"
          value={events.length}
        />
        <Stat
          title="Verified Organizers"
          value={stats.verifiedOrganizers}
        />
        <Stat
          title="Paid Advertisers"
          value={stats.paidAdvertisers}
        />
      </section>

      <section style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2>Recent Vendors</h2>

            <Link
              href="/admin/vendors"
              style={styles.link}
            >
              View all →
            </Link>
          </div>

          {vendors.length === 0 ? (
            <p style={styles.muted}>
              No vendor profiles yet.
            </p>
          ) : (
            vendors.slice(0, 8).map((vendor) => (
              <div
                key={vendor.id}
                style={styles.row}
              >
                <div>
                  <strong>
                    {vendor.business_name ||
                      "Unnamed Vendor"}
                  </strong>

                  <p style={styles.rowSub}>
                    {vendor.city},{" "}
                    {vendor.state}
                  </p>
                </div>

                <div style={styles.rowRight}>
                  {vendor.verified && (
                    <span style={styles.badge}>
                      Verified
                    </span>
                  )}

                  {vendor.featured && (
                    <span style={styles.goldBadge}>
                      Featured
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2>Recent Organizers</h2>

            <Link
              href="/admin/events"
              style={styles.link}
            >
              View all →
            </Link>
          </div>

          {events.length === 0 ? (
            <p style={styles.muted}>
              No organizers yet.
            </p>
          ) : (
            events.slice(0, 8).map((event) => (
              <div
                key={event.id}
                style={styles.row}
              >
                <div>
                  <strong>
                    {event.title ||
                      "Untitled Event"}
                  </strong>

                  <p style={styles.rowSub}>
                    {event.city},{" "}
                    {event.state}
                  </p>
                </div>

                <div style={styles.rowRight}>
                  {event.verified_organizer && (
                    <span style={styles.badge}>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2>Paid Advertisers</h2>

          <Link
            href="/admin/payments"
            style={styles.link}
          >
            Payment history →
          </Link>
        </div>

        {adOrders.filter(
          (a) => a.payment_status === "paid"
        ).length === 0 ? (
          <p style={styles.muted}>
            No advertisers yet.
          </p>
        ) : (
          adOrders
            .filter(
              (a) => a.payment_status === "paid"
            )
            .slice(0, 10)
            .map((ad) => (
              <div
                key={ad.id}
                style={styles.row}
              >
                <div>
                  <strong>
                    {ad.business_name ||
                      "Business"}
                  </strong>

                  <p style={styles.rowSub}>
                    {ad.customer_email ||
                      "Email unavailable"}
                  </p>
                </div>

                <div style={styles.rowRight}>
                  <span
                    style={styles.goldBadge}
                  >
                    $
                    {(
                      (ad.amount_total ||
                        0) / 100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
        )}
      </section>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div style={styles.statCard}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    padding: "34px 18px",
    color: "#10291f",
    fontFamily:
      "Inter, system-ui, sans-serif",
  },

  hero: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding:
      "clamp(28px, 5vw, 56px)",
    boxShadow:
      "0 24px 70px rgba(20,88,63,.12)",
  },

  eyebrow: {
    color: "#14583f",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".16em",
    fontSize: 12,
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(42px, 7vw, 76px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },

  text: {
    maxWidth: 760,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },

  statsGrid: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
  },

  statCard: {
    background: "#10291f",
    color: "#fff",
    borderRadius: 26,
    padding: 22,
  },

  grid: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: 18,
  },

  panel: {
    maxWidth: 1180,
    margin: "0 auto 22px",
    background: "#fff",
    borderRadius: 28,
    padding: 24,
    border: "1px solid #e7dcc7",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  link: {
    color: "#14583f",
    textDecoration: "none",
    fontWeight: 900,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid #eee5d6",
  },

  rowSub: {
    color: "#5f6b66",
    margin: "6px 0 0",
  },

  rowRight: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  badge: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
  },

  goldBadge: {
    background: "#14583f",
    color: "#fff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
  },

  muted: {
    color: "#5f6b66",
  },
};