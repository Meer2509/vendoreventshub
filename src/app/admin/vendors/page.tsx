"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["meerhamzakhan2020@gmail.com"];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadVendors() {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setVendors(data || []);
    }

    setLoading(false);
  }

  async function checkAdmin() {
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
    await loadVendors();
  }

  async function updateVendor(id: string, updates: any) {
    const { error } = await supabase
      .from("vendor_profiles")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadVendors();
  }

  async function deleteVendor(id: string) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this vendor?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("vendor_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadVendors();
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) {
    return <main style={styles.page}>Loading vendors...</main>;
  }

  if (!allowed) {
    return <main style={styles.page}>Access denied.</main>;
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>VendorEventsHub Admin</p>

        <h1 style={styles.title}>Vendors Management</h1>

        <p style={styles.text}>
          Review vendor businesses, feature premium vendors, verify trusted
          businesses, hide spam, and manage marketplace quality.
        </p>
      </section>

      <section style={styles.grid}>
        {vendors.length === 0 ? (
          <div style={styles.card}>No vendor profiles found.</div>
        ) : (
          vendors.map((vendor) => (
            <article key={vendor.id} style={styles.card}>
              {vendor.banner_url && (
                <img
                  src={vendor.banner_url}
                  alt={vendor.business_name}
                  style={styles.banner}
                />
              )}

              <div style={styles.vendorTop}>
                <img
                  src={
                    vendor.logo_url ||
                    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
                  }
                  alt={vendor.business_name}
                  style={styles.logo}
                />

                <div style={{ flex: 1 }}>
                  <div style={styles.topRow}>
                    {vendor.featured && (
                      <span style={styles.badge}>Featured Vendor</span>
                    )}

                    {vendor.verified && (
                      <span style={styles.badge}>
                        Verified Vendor
                      </span>
                    )}
                  </div>

                  <h2 style={styles.cardTitle}>
                    {vendor.business_name || "Unnamed Vendor"}
                  </h2>

                  <p style={styles.location}>
                    {vendor.city || "City"},{" "}
                    {vendor.state || "State"}
                  </p>
                </div>
              </div>

              <div style={styles.infoBox}>
                <p>
                  <strong>Category:</strong>{" "}
                  {vendor.category || "N/A"}
                </p>

                <p>
                  <strong>Years in Business:</strong>{" "}
                  {vendor.years_in_business || "New"}
                </p>

                <p>
                  <strong>Website:</strong>{" "}
                  {vendor.website || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {vendor.email || "N/A"}
                </p>
              </div>

              <p style={styles.description}>
                {vendor.short_description ||
                  "No business description added."}
              </p>

              <div style={styles.actions}>
                <button
                  style={styles.approve}
                  onClick={() =>
                    updateVendor(vendor.id, {
                      featured: !vendor.featured,
                    })
                  }
                >
                  {vendor.featured
                    ? "Unfeature"
                    : "Feature"}
                </button>

                <button
                  style={styles.pause}
                  onClick={() =>
                    updateVendor(vendor.id, {
                      verified: !vendor.verified,
                    })
                  }
                >
                  {vendor.verified
                    ? "Unverify"
                    : "Verify"}
                </button>

                <button
                  style={styles.pause}
                  onClick={() =>
                    updateVendor(vendor.id, {
                      hidden: !vendor.hidden,
                    })
                  }
                >
                  {vendor.hidden
                    ? "Unhide"
                    : "Hide"}
                </button>

                <button
                  style={styles.reject}
                  onClick={() => deleteVendor(vendor.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f3ea",
    padding: "34px 18px",
    color: "#10291f",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  hero: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 34,
    padding: "clamp(28px, 5vw, 56px)",
    boxShadow: "0 24px 70px rgba(20, 88, 63, .12)",
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
    fontSize: "clamp(42px, 7vw, 76px)",
    lineHeight: 0.95,
    letterSpacing: "-.06em",
  },

  text: {
    maxWidth: 760,
    color: "#5f6b66",
    fontSize: 18,
    lineHeight: 1.7,
  },

  grid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 18,
  },

  card: {
    background: "#fff",
    border: "1px solid #e7dcc7",
    borderRadius: 28,
    overflow: "hidden",
    padding: 22,
    boxShadow:
      "0 20px 55px rgba(20, 88, 63, .10)",
  },

  banner: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 18,
    marginBottom: 16,
  },

  vendorTop: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 999,
    objectFit: "cover",
    border: "3px solid #e8ddc7",
  },

  topRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  badge: {
    background: "#e8ddc7",
    color: "#14583f",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
  },

  cardTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
  },

  location: {
    marginTop: 6,
    color: "#5f6b66",
  },

  infoBox: {
    background: "#f7f3ea",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    lineHeight: 1.6,
  },

  description: {
    color: "#5f6b66",
    lineHeight: 1.6,
    marginTop: 16,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginTop: 18,
  },

  approve: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#14583f",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  pause: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#e8ddc7",
    color: "#10291f",
    fontWeight: 900,
    cursor: "pointer",
  },

  reject: {
    border: 0,
    borderRadius: 999,
    padding: "12px 10px",
    background: "#8b1e1e",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};