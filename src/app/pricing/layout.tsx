import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Transparent VendorEventsHub pricing for vendors and organizers. Founding access available as we launch state by state.",
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
