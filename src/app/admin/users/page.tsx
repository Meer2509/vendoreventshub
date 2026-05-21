"use client";

import { useEffect, useMemo, useState } from "react";
import { clearProfileRoleCache } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  business_name?: string | null;
  role?: string | null;
  created_at?: string | null;
  suspended?: boolean | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hasSuspendedColumn, setHasSuspendedColumn] = useState<boolean | null>(null);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setUsers([]);
    } else {
      setUsers((data as ProfileRow[]) || []);
      if (data && data.length > 0) {
        setHasSuspendedColumn(
          Object.prototype.hasOwnProperty.call(data[0], "suspended")
        );
      } else {
        setHasSuspendedColumn(false);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" || String(user.role || "vendor") === roleFilter;
      const matchesSearch =
        !q ||
        user.email?.toLowerCase().includes(q) ||
        user.full_name?.toLowerCase().includes(q) ||
        user.business_name?.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  async function updateRole(userId: string, role: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) alert(error.message);
    else {
      clearProfileRoleCache(userId);
      await loadUsers();
    }
  }

  async function toggleSuspend(userId: string, suspended: boolean) {
    if (!hasSuspendedColumn) return;

    const { error } = await supabase
      .from("profiles")
      .update({ suspended })
      .eq("id", userId);

    if (error) alert(error.message);
    else await loadUsers();
  }

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Users</p>
        <h1>Platform accounts</h1>
        <p className="adminMuted">
          Search profiles, change roles (vendor / organizer / admin), and manage
          access.
          {hasSuspendedColumn === false && (
            <> Suspend is disabled until you add a <code>profiles.suspended</code> boolean column.</>
          )}
        </p>
      </section>

      <div className="adminToolbar">
        <input
          placeholder="Search email, name, business, user id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="vendor">Vendor</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
          <option value="both">Both</option>
        </select>
        <button type="button" className="adminBtn adminBtnSecondary" onClick={loadUsers}>
          Refresh
        </button>
      </div>

      <section className="adminPanel">
        {loading ? (
          <p className="adminMuted">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="adminMuted">No users match this search.</p>
        ) : (
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.full_name || user.business_name || "Unnamed"}</strong>
                    <br />
                    <span className="adminMuted">{user.email || user.id}</span>
                  </td>
                  <td>
                    <select
                      value={user.role || "vendor"}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                    >
                      <option value="vendor">vendor</option>
                      <option value="organizer">organizer</option>
                      <option value="admin">admin</option>
                      <option value="both">both</option>
                    </select>
                  </td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <div className="adminActions">
                      <button
                        type="button"
                        className="adminBtn adminBtnSecondary"
                        disabled={!hasSuspendedColumn}
                        title={
                          hasSuspendedColumn
                            ? "Toggle suspended"
                            : "Add profiles.suspended column in Supabase"
                        }
                        onClick={() =>
                          toggleSuspend(user.id, !Boolean(user.suspended))
                        }
                      >
                        {user.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
