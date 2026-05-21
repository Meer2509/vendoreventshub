import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About VendorEventsHub",
  description:
    "VendorEventsHub is a vendor intelligence platform helping vendors compare festivals, craft fairs, flea markets, and farmers markets before applying.",
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
