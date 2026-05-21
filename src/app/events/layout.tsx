import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Vendor Events Near You",
  description:
    "Discover vendor events, craft fairs looking for vendors, flea market opportunities, farmers market registration, and festival vendor applications. Compare booth fees and traffic before you apply.",
  path: "/events",
  keywords: [
    "vendor events",
    "craft fairs looking for vendors",
    "flea market vendor opportunities",
    "farmers market vendor registration",
    "festival vendor applications",
    "vendor events near me",
  ],
});

import { Suspense } from "react";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
