/** Shared helpers for admin dashboard pages. */

import type { SupabaseClient } from "@supabase/supabase-js";

export function rowHasColumn(
  row: Record<string, unknown> | null | undefined,
  column: string
): boolean {
  if (!row) return false;
  return Object.prototype.hasOwnProperty.call(row, column);
}

export function detectColumns(
  rows: Record<string, unknown>[],
  columns: string[]
): Record<string, boolean> {
  const sample = rows[0];
  return Object.fromEntries(
    columns.map((column) => [column, rowHasColumn(sample, column)])
  ) as Record<string, boolean>;
}

export function formatAdminMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function getAdminAccessToken(): Promise<string | null> {
  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** SQL snippets shown when a column/table is missing. */
export const ADMIN_COLUMN_SQL: Record<string, string> = {
  "ad_orders.approval_status":
    "ALTER TABLE ad_orders ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending_review';",
  "vendor_profiles.verified":
    "ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;",
  "organizer_profiles.verified":
    "ALTER TABLE organizer_profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;",
  "events.verified_organizer":
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS verified_organizer boolean DEFAULT false;",
};

export function missingColumnAlert(table: string, column: string): string {
  const key = `${table}.${column}`;
  const sql =
    ADMIN_COLUMN_SQL[key] ||
    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} text;`;
  return `Missing column: ${table}.${column}. Run this SQL:\n\n${sql}`;
}

export function missingTableAlert(table: string): string {
  return `Missing table: ${table}. Create it in Supabase before using this action.`;
}

export function isMissingColumnError(message: string): boolean {
  return (
    /column .* does not exist/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /unknown column/i.test(message)
  );
}

export function isMissingTableError(message: string): boolean {
  return (
    /relation .* does not exist/i.test(message) ||
    /could not find the table/i.test(message)
  );
}

export function isRlsOrPermissionError(message: string): boolean {
  return (
    /row-level security/i.test(message) ||
    /permission denied/i.test(message) ||
    /not authorized/i.test(message) ||
    /policy/i.test(message)
  );
}

type AdminMutationOptions = {
  actionLabel: string;
  table: string;
  column?: string;
  hasColumn?: boolean;
  run: () => Promise<{ error: { message: string } | null }>;
  onSuccess?: () => void | Promise<void>;
};

/** Run an admin Supabase mutation with logging, alerts, and reload hook. */
export async function runAdminMutation(
  options: AdminMutationOptions
): Promise<boolean> {
  const { actionLabel, table, column, hasColumn, run, onSuccess } = options;

  if (column && hasColumn === false) {
    const msg = missingColumnAlert(table, column);
    console.error(`[Admin] ${actionLabel}:`, msg);
    alert(msg);
    return false;
  }

  const { error } = await run();

  if (error) {
    console.error(`[Admin] ${actionLabel} failed (${table}):`, error);

    if (column && isMissingColumnError(error.message)) {
      alert(missingColumnAlert(table, column));
    } else if (isMissingTableError(error.message)) {
      alert(missingTableAlert(table));
    } else {
      alert(`${actionLabel} failed: ${error.message}`);
    }
    return false;
  }

  alert(`${actionLabel} succeeded.`);
  await onSuccess?.();
  return true;
}

/** Approve ad: ad_orders.approval_status = 'approved' */
export async function approveAdOrder(
  client: SupabaseClient,
  adId: string,
  hasApprovalColumn: boolean,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  return runAdminMutation({
    actionLabel: "Approve ad",
    table: "ad_orders",
    column: "approval_status",
    hasColumn: hasApprovalColumn,
    run: async () =>
      client
        .from("ad_orders")
        .update({ approval_status: "approved" })
        .eq("id", adId),
    onSuccess,
  });
}

/** Approve vendor: vendor_profiles.verified = true */
export async function approveVendor(
  client: SupabaseClient,
  userId: string,
  hasVerifiedColumn: boolean,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  return runAdminMutation({
    actionLabel: "Approve vendor",
    table: "vendor_profiles",
    column: "verified",
    hasColumn: hasVerifiedColumn,
    run: async () =>
      client
        .from("vendor_profiles")
        .update({ verified: true })
        .eq("user_id", userId),
    onSuccess,
  });
}

/** Approve organizer: organizer_profiles.verified = true */
export async function approveOrganizer(
  client: SupabaseClient,
  userId: string,
  hasVerifiedColumn: boolean,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  return runAdminMutation({
    actionLabel: "Approve organizer",
    table: "organizer_profiles",
    column: "verified",
    hasColumn: hasVerifiedColumn,
    run: async () =>
      client
        .from("organizer_profiles")
        .update({ verified: true })
        .eq("user_id", userId),
    onSuccess,
  });
}

/** Approve event organizer badge: events.verified_organizer = true */
export async function approveEventOrganizer(
  client: SupabaseClient,
  eventId: string,
  hasColumn: boolean,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  return runAdminMutation({
    actionLabel: "Approve event organizer",
    table: "events",
    column: "verified_organizer",
    hasColumn: hasColumn,
    run: async () =>
      client
        .from("events")
        .update({ verified_organizer: true })
        .eq("id", eventId),
    onSuccess,
  });
}

/** Fallback when client update is blocked by RLS — uses admin API + service role. */
export async function approveAdOrderViaApi(
  adId: string,
  onSuccess?: () => void | Promise<void>
): Promise<boolean> {
  const token = await getAdminAccessToken();
  if (!token) {
    alert("Session expired. Please log in again.");
    return false;
  }

  const res = await fetch("/api/update-ad-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: adId, status: "approved" }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[Admin] Approve ad (API) failed:", data);
    alert(
      data.error ||
        "Approve ad failed via API. Set SUPABASE_SERVICE_ROLE_KEY on the server and ensure your account has profiles.role = admin."
    );
    return false;
  }

  alert("Approve ad succeeded.");
  await onSuccess?.();
  return true;
}
