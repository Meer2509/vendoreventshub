"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PremiumEmptyState from "@/components/PremiumEmptyState";
import { detectColumns } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

const VENDOR_COLUMNS = ["verified", "featured"] as const;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<Record<string, boolean>>({
    verified: true,
    featured: true,
  });

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
      const rows = (data || []) as Record<string, unknown>[];
      setVendors(rows);
      if (rows.length > 0) {
        setColumns(detectColumns(rows, [...VENDOR_COLUMNS]));
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
        String(vendor.business_name || "")
          .toLowerCase()
          .includes(q) ||
        String(vendor.slug || "")
          .toLowerCase()
          .includes(q) ||
        String(vendor.user_id || "")
          .toLowerCase()
          .includes(q)
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

  async function deleteVendor(userId: string, name: string) {
    if (
      !confirm(
        `Delete vendor profile "${name}"?\n\nThis removes the public profile only — not the auth account.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("vendor_profiles")
      .delete()
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
          Verify vendors, feature profiles, open public pages, or remove profiles.
        </p>
        {!columns.verified && (
          <p className="adminMuted">
            Missing <code>vendor_profiles.verified</code> — Verify disabled.
          </p>
        )}
        {!columns.featured && (
          <p className="adminMuted">
            Missing <code>vendor_profiles.featured</code> — Feature disabled.
          </p>
        )}
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => {
                const userId = String(vendor.user_id);
                const slug = String(vendor.slug || "");

                return (
                  <tr key={userId}>
                    <td>
                      <strong>{String(vendor.business_name || "Unnamed")}</strong>
                      <br />
                      <span className="adminMuted">{slug || userId}</span>
                    </td>
                    <td>
                      <div className="adminBadgeRow">
                        {Boolean(vendor.verified) && (
                          <span className="adminBadge">Verified</span>
                        )}
                        {Boolean(vendor.featured) && (
                          <span className="adminBadge">Featured</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="adminActions">
                        {slug ? (
                          <Link
                            href={`/vendors/${slug}`}
                            className="adminBtn adminBtnSecondary"
                            target="_blank"
                          >
                            Open
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="adminBtn adminBtnSecondary"
                            disabled
                            title="No public slug"
                          >
                            Open
                          </button>
                        )}
                        <button
                          type="button"
                          className="adminBtn adminBtnGold"
                          disabled={!columns.verified}
                          onClick={() =>
                            updateVendor(userId, {
                              verified: !Boolean(vendor.verified),
                            })
                          }
                        >
                          {vendor.verified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnSecondary"
                          disabled={!columns.featured}
                          onClick={() =>
                            updateVendor(userId, {
                              featured: !Boolean(vendor.featured),
                            })
                          }
                        >
                          {vendor.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          type="button"
                          className="adminBtn adminBtnDanger"
                          onClick={() =>
                            deleteVendor(
                              userId,
                              String(vendor.business_name || "vendor")
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
