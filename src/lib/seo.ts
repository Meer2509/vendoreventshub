import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.vendoreventshub.com";

export const SITE_NAME = "VendorEventsHub";

export const DEFAULT_DESCRIPTION =
  "VendorEventsHub is a vendor intelligence platform helping vendors compare festivals, craft fairs, flea markets, and farmers markets before applying.";

const DEFAULT_KEYWORDS = [
  "vendor events",
  "craft fairs looking for vendors",
  "flea market vendor opportunities",
  "farmers market vendor registration",
  "festival vendor applications",
  "vendor events near me",
];

export function absoluteUrl(path = "/") {
  const base = SITE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

type PageMetaInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle =
    path === "/" ? `${SITE_NAME} | Vendor Event Intelligence` : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
