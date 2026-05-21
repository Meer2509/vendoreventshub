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

function roleCacheKey(userId: string) {
  return `veh_profile_role_${userId}`;
}

export function clearProfileRoleCache(userId?: string) {
  if (typeof window === "undefined") return;
  if (userId) {
    sessionStorage.removeItem(roleCacheKey(userId));
    return;
  }
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("veh_profile_role_")) sessionStorage.removeItem(key);
  });
}

export async function getProfileRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data?.role) {
    const resolved: UserRole =
      data.role === "organizer" ||
      data.role === "admin" ||
      data.role === "both"
        ? data.role
        : "vendor";

    if (typeof window !== "undefined") {
      sessionStorage.setItem(roleCacheKey(userId), resolved);
    }

    return resolved;
  }

  if (error) {
    console.warn("getProfileRole:", error.message);
  }

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(roleCacheKey(userId));
    if (
      cached === "organizer" ||
      cached === "admin" ||
      cached === "both" ||
      cached === "vendor"
    ) {
      return cached;
    }
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

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

/** Organizer tools + full admin override (edit any event, etc.). */
export async function requireOrganizerOrAdminAccess(): Promise<{
  user: User;
  isAdmin: boolean;
} | null> {
  const auth = await requireAuth("/login");
  if (!auth) return null;

  const role = await getProfileRole(auth.user.id);

  if (isAdminRole(role)) {
    return { user: auth.user, isAdmin: true };
  }

  if (canAccessOrganizerDashboard(role)) {
    return { user: auth.user, isAdmin: false };
  }

  window.location.assign(dashboardPathForRole(role));
  return null;
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
  const auth = await requireVendorDashboard();
  return auth ? { user: auth.user } : null;
}

export async function requireOrganizerAccess(): Promise<{ user: User } | null> {
  const auth = await requireOrganizerDashboard();
  return auth ? { user: auth.user } : null;
}

/** Non-destructive admin check for layouts — does not redirect. */
export async function resolveAdminAccess(): Promise<{ user: User } | null> {
  const user = await waitForUser(12);
  if (!user) return null;

  const role = await getProfileRole(user.id);
  if (role !== "admin") return null;

  return { user };
}

export async function requireAdmin(): Promise<{ user: User } | null> {
  const auth = await resolveAdminAccess();
  if (auth) return auth;

  const { user } = await getAuthSession();
  if (!user) {
    window.location.assign("/login");
    return null;
  }

  const role = await getProfileRole(user.id);
  window.location.assign(dashboardPathForRole(role));
  return null;
}
