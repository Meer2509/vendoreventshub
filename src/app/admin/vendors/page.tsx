"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { supabase } from "@/lib/supabase";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hasFeaturedColumn, setHasFeaturedColumn] = useState(true);

  async function loadVendors() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setVendors([]);
    } else {
      const rows = data || [];
      setVendors(rows);
      if (rows.length > 0) {
        setHasFeaturedColumn(Object.prototype.hasOwnProperty.call(rows[0], "featured"));
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vendors.filter((vendor) => {
      if (!q) return true;
      return (
        vendor.business_name?.toLowerCase().includes(q) ||
        vendor.slug?.toLowerCase().includes(q) ||
        vendor.user_id?.toLowerCase().includes(q)
      );
    });
  }, [vendors, search]);

  async function updateVendor(userId: string, updates: Record<string, unknown>) {
    const { error } = await supabase
      .from("vendor_profiles")
      .update(updates)
      .eq("user_id", userId);

    if (error) alert(error.message);
    else await loadVendors();
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Vendors</p>
        <h1>Vendor profiles</h1>
        <p className="adminMuted">
          Verify vendors, open public profiles, and manage marketplace trust.
          {!hasFeaturedColumn && (
            <> Add <code>vendor_profiles.featured</code> boolean to enable featuring.</>
          )}
        </p>
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search business name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="adminBtn adminBtnSecondary" onClick={loadVendors}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="adminMuted">Loading vendors...</p>
      ) : filtered.length === 0 ? (
        <PremiumEmptyState
          title="No vendor profiles"
          description="Vendors appear here after completing profile setup."
          actionLabel="View Users"
          onAction={() => (window.location.href = "/admin/users")}
        />
      ) : (
        <section className="adminPanel">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Business</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => (
                <tr key={vendor.user_id}>
                  <td>
                    <strong>{vendor.business_name || "Unnamed"}</strong>
                    <br />
                    <span className="adminMuted">{vendor.slug || vendor.user_id}</span>
                  </td>
                  <td>
                    <div className="adminActions">
                      <button
                        type="button"
                        className="adminBtn adminBtnGold"
                        onClick={() =>
                          updateVendor(vendor.user_id, {
                            verified: !Boolean(vendor.verified),
                          })
                        }
                      >
                        {vendor.verified ? "Verified" : "Verify"}
                      </button>
                      <button
                        type="button"
                        className="adminBtn adminBtnSecondary"
                        disabled={!hasFeaturedColumn}
                        onClick={() =>
                          updateVendor(vendor.user_id, {
                            featured: !Boolean(vendor.featured),
                          })
                        }
                      >
                        {vendor.featured ? "Featured" : "Feature"}
                      </button>
                      {vendor.slug ? (
                        <Link
                          href={`/vendors/${vendor.slug}`}
                          className="adminBtn adminBtnSecondary"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
