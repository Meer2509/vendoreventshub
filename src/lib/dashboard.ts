import { getVendorScore } from "@/lib/event-display";

export type PipelineTab =
  | "all"
  | "saved"
  | "applied"
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted";

export type AppFilterTab =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted";

/** Normalize Supabase nested `events(*)` join (object or single-element array). */
export function joinedEvent(events: unknown): Record<string, unknown> | null {
  if (!events) return null;
  if (Array.isArray(events)) {
    const first = events[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : null;
  }
  if (typeof events === "object") return events as Record<string, unknown>;
  return null;
}

export function formatDashboardDate(date?: string | null) {
  if (!date) return "Date TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function statusLabel(status?: string | null): string {
  const key = String(status || "requested").toLowerCase();
  const map: Record<string, string> = {
    requested: "Pending",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    waitlist: "Waitlisted",
    waitlisted: "Waitlisted",
    attended: "Attended",
  };
  return map[key] || status || "Pending";
}

export function statusBadgeClass(status?: string | null): string {
  const key = String(status || "requested").toLowerCase();
  if (key === "approved" || key === "attended") return "vehDashBadge vehDashBadgeApproved";
  if (key === "rejected") return "vehDashBadge vehDashBadgeRejected";
  if (key === "waitlist" || key === "waitlisted")
    return "vehDashBadge vehDashBadgeWaitlist";
  if (key === "saved") return "vehDashBadge vehDashBadgeSaved";
  if (key === "closed") return "vehDashBadge vehDashBadgeClosed";
  return "vehDashBadge vehDashBadgePending";
}

export function calcVendorProfileStrength(
  vendorProfile: Record<string, unknown> | null,
  profile: Record<string, unknown> | null
): number {
  const source = vendorProfile || profile;
  if (!source) return 20;

  let score = 20;
  if (source.business_name) score += 20;
  if (source.logo_url) score += 15;
  if (source.banner_url) score += 15;
  if (source.short_description || source.description || source.full_description)
    score += 15;
  if (source.website || source.website_url) score += 10;
  if (source.facebook || source.facebook_url) score += 5;
  if (source.instagram || source.instagram_url) score += 5;
  if (source.tiktok || source.tiktok_url) score += 5;
  if (source.phone) score += 10;
  return Math.min(score, 100);
}

export function calcOrganizerProfileStrength(
  organizerProfile: Record<string, unknown> | null,
  profile: Record<string, unknown> | null
): number {
  const source = organizerProfile || profile;
  if (!source) return 20;

  let score = 20;
  if (source.organizer_name || source.business_name) score += 25;
  if (source.logo_url) score += 15;
  if (source.banner_url) score += 10;
  if (source.short_description || source.full_description) score += 15;
  if (source.website) score += 10;
  if (source.instagram || source.facebook || source.tiktok) score += 10;
  if (source.phone) score += 5;
  return Math.min(score, 100);
}

export function eventVendorScore(event: Record<string, unknown> | null | undefined) {
  if (!event) return null;
  return getVendorScore(event as Parameters<typeof getVendorScore>[0]);
}

export function formatBoothPrice(value: unknown) {
  const booth = Number(value || 0);
  if (!booth) return "TBD";
  return `$${booth}`;
}

export function countByStatus(
  rows: { status?: string | null }[],
  status: string
) {
  return rows.filter(
    (row) => String(row.status || "").toLowerCase() === status.toLowerCase()
  ).length;
}
