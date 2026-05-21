import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { US_STATES, slugifyLocation } from "@/lib/locations";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase();
  const now = new Date();

  const staticRoutes = [
    "/",
    "/events",
    "/vendors",
    "/about",
    "/pricing",
    "/advertise",
    "/contact",
    "/privacy",
    "/terms",
    "/signup",
    "/login",
    "/create-event",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  const stateRoutes = US_STATES.map((state) => ({
    url: absoluteUrl(`/events/${state.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: state.slug === "connecticut" ? 0.85 : 0.65,
  }));

  const [{ data: events }, { data: vendors }, { data: organizers }] =
    await Promise.all([
      supabase.from("events").select("id, created_at, city, state"),
      supabase.from("vendor_profiles").select("slug, user_id").not("slug", "is", null),
      supabase
        .from("organizer_profiles")
        .select("slug, user_id")
        .not("slug", "is", null),
    ]);

  const eventRoutes =
    events?.map((event) => ({
      url: absoluteUrl(`/events/${event.id}`),
      lastModified: event.created_at ? new Date(event.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  const cityRoutes: MetadataRoute.Sitemap = [];
  const cityKeys = new Set<string>();

  for (const event of events || []) {
    const stateSlug = US_STATES.find(
      (s) =>
        s.abbr.toLowerCase() === String(event.state || "").toLowerCase() ||
        s.name.toLowerCase() === String(event.state || "").toLowerCase()
    )?.slug;

    const citySlug = slugifyLocation(event.city || "");
    if (!stateSlug || !citySlug) continue;

    const key = `${stateSlug}/${citySlug}`;
    if (cityKeys.has(key)) continue;
    cityKeys.add(key);

    cityRoutes.push({
      url: absoluteUrl(`/events/${stateSlug}/${citySlug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const vendorRoutes =
    vendors?.map((vendor) => ({
      url: absoluteUrl(`/vendors/${vendor.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })) || [];

  const organizerRoutes =
    organizers?.map((organizer) => ({
      url: absoluteUrl(`/organizers/${organizer.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })) || [];

  return [
    ...staticRoutes,
    ...stateRoutes,
    ...cityRoutes,
    ...eventRoutes,
    ...vendorRoutes,
    ...organizerRoutes,
  ];
}
