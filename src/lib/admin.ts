/** Shared helpers for admin dashboard pages. */

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
