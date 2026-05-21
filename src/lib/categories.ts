export type EventCategorySeo = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  keywords: string[];
  matchCategories: string[];
};

export const EVENT_SEO_CATEGORIES: EventCategorySeo[] = [
  {
    slug: "craft-fairs",
    title: "Craft Fairs",
    headline: "Craft Fairs Looking for Vendors",
    description:
      "Discover craft fairs and artisan markets looking for vendors. Compare booth fees, traffic, and organizer trust before you apply.",
    keywords: [
      "craft fairs looking for vendors",
      "artisan market vendor applications",
      "craft fair booth fees",
    ],
    matchCategories: ["Craft Fair", "Artisan Market", "Holiday Market"],
  },
  {
    slug: "farmers-markets",
    title: "Farmers Markets",
    headline: "Farmers Markets Looking for Vendors",
    description:
      "Find farmers market vendor registration opportunities with booth fee transparency and vendor intelligence.",
    keywords: [
      "farmers market vendor registration",
      "farmers markets looking for vendors",
      "farmers market booth fees",
    ],
    matchCategories: ["Farmers Market", "Farmers market"],
  },
  {
    slug: "flea-markets",
    title: "Flea Markets",
    headline: "Flea Markets Accepting Vendors",
    description:
      "Browse flea market vendor opportunities and compare traffic signals, booth fees, and organizer profiles.",
    keywords: [
      "flea market vendor opportunities",
      "flea markets accepting vendors",
      "flea market booth rental",
    ],
    matchCategories: ["Flea Market", "Flea market"],
  },
  {
    slug: "food-festivals",
    title: "Food Festivals",
    headline: "Food Festivals Looking for Vendors",
    description:
      "Find food truck events, food festivals, and culinary vendor opportunities with Vendor Score™ signals.",
    keywords: [
      "food festival vendor applications",
      "food truck events near me",
      "food vendor opportunities",
    ],
    matchCategories: [
      "Food Truck Event",
      "Food Festival",
      "Festival",
      "Food festival",
    ],
  },
  {
    slug: "festivals",
    title: "Festivals",
    headline: "Festival Vendor Applications",
    description:
      "Compare festival vendor applications, booth fees, and expected traffic before committing inventory.",
    keywords: ["festival vendor applications", "festival booth fees", "vendor events"],
    matchCategories: ["Festival", "Community Fair", "Expo"],
  },
];

export function getCategoryBySlug(slug: string): EventCategorySeo | undefined {
  const normalized = slug.toLowerCase().trim();
  return EVENT_SEO_CATEGORIES.find((c) => c.slug === normalized);
}

export function eventMatchesCategory(
  eventCategory: string | null | undefined,
  seoCategory: EventCategorySeo
) {
  const norm = String(eventCategory || "").toLowerCase().trim();
  if (!norm) return false;

  return seoCategory.matchCategories.some((match) => {
    const m = match.toLowerCase();
    return norm === m || norm.includes(m) || m.includes(norm);
  });
}
