import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Advertise on VendorEventsHub",
  description:
    "Promote your festival, fair, market, or business to event-ready vendors on America’s vendor intelligence marketplace.",
  path: "/advertise",
});

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
