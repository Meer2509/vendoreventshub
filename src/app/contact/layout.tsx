import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact VendorEventsHub",
  description:
    "Contact VendorEventsHub for vendor marketplace support, organizer listings, and advertising questions.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
