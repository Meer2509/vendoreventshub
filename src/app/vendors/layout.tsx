import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Vendor Directory",
  description:
    "Browse vendor profiles on VendorEventsHub. Find food trucks, artisans, and market-ready businesses building their event presence.",
  path: "/vendors",
});

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
