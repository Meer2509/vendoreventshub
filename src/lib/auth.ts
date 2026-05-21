import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "vendor" | "organizer" | "admin" | "both";

export async function getAuthSession() {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    user: data.session?.user ?? null,
    error,
  };
}

/** Prefer session (local) before network getUser to avoid flaky sign-out on navigation. */
export async function getAuthUser() {
  const sessionResult = await getAuthSession();
  if (sessionResult.user) {
    return sessionResult;
  }

  const { data, error } = await supabase.auth.getUser();
  return {
    session: sessionResult.session,
    user: data.user ?? null,
    error: error ?? sessionResult.error,
  };
}

export async function getProfileRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = data?.role;
  if (role === "organizer" || role === "admin" || role === "both") {
    return role;
  }
  return "vendor";
}

export function dashboardPathForRole(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "organizer") return "/dashboard/organizer";
  return "/dashboard/vendor";
}

export function normalizeSignupRole(
  accountType: string
): "vendor" | "organizer" {
  return accountType === "organizer" ? "organizer" : "vendor";
}

export function canAccessVendorDashboard(role: UserRole): boolean {
  return role === "vendor" || role === "both";
}

export function canAccessOrganizerDashboard(role: UserRole): boolean {
  return role === "organizer" || role === "both";
}

async function waitForUser(maxAttempts = 8): Promise<User | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { user } = await getAuthSession();
    if (user) return user;

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  const { user } = await getAuthUser();
  return user;
}

export async function requireAuth(
  loginPath = "/login"
): Promise<{ user: User } | null> {
  const user = await waitForUser();

  if (!user) {
    window.location.assign(loginPath);
    return null;
  }

  return { user };
}

export async function requireVendorDashboard(): Promise<{
  user: User;
  role: UserRole;
} | null> {
  const auth = await requireAuth("/login/vendor");
  if (!auth) return null;

  const role = await getProfileRole(auth.user.id);

  if (role === "admin") {
    window.location.assign("/admin");
    return null;
  }

  if (!canAccessVendorDashboard(role)) {
    window.location.assign("/dashboard/organizer");
    return null;
  }

  return { user: auth.user, role };
}

export async function requireOrganizerDashboard(): Promise<{
  user: User;
  role: UserRole;
} | null> {
  const auth = await requireAuth("/login/organizer");
  if (!auth) return null;

  const role = await getProfileRole(auth.user.id);

  if (role === "admin") {
    window.location.assign("/admin");
    return null;
  }

  if (!canAccessOrganizerDashboard(role)) {
    window.location.assign("/dashboard/vendor");
    return null;
  }

  return { user: auth.user, role };
}

export async function routeDashboardByRole(): Promise<void> {
  const auth = await requireAuth("/login");
  if (!auth) return;

  const role = await getProfileRole(auth.user.id);
  window.location.assign(dashboardPathForRole(role));
}

export async function requireVendorAccess(): Promise<{ user: User } | null> {
  return requireAuth("/login/vendor");
}

export async function requireOrganizerAccess(): Promise<{ user: User } | null> {
  return requireAuth("/login/organizer");
}

export async function requireAdmin(): Promise<{ user: User } | null> {
  const auth = await requireAuth("/login");
  if (!auth) return null;

  const role = await getProfileRole(auth.user.id);
  if (role !== "admin") {
    window.location.assign(dashboardPathForRole(role));
    return null;
  }

  return auth;
}
