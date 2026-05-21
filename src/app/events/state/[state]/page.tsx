import LocationEventsClient from "@/components/LocationEventsClient";
import { buildPageMetadata } from "@/lib/seo";
import { getStateBySlug } from "@/lib/locations";

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);

  if (!state) {
    return buildPageMetadata({
      title: "Vendor Events by State",
      path: `/events/${stateSlug}`,
    });
  }

  return buildPageMetadata({
    title: `Vendor Events in ${state.name}`,
    description: `Find craft fairs, flea markets, farmers market vendor registration, and festival vendor applications in ${state.name}. Compare booth fees and vendor intelligence on VendorEventsHub.`,
    path: `/events/${state.slug}`,
    keywords: [
      `vendor events in ${state.name}`,
      `craft fairs looking for vendors ${state.abbr}`,
      `flea market vendor opportunities ${state.abbr}`,
      `farmers market vendor registration ${state.abbr}`,
      "vendor events near me",
    ],
  });
}

export default async function StateEventsPage({ params }: Props) {
  const { state } = await params;
  return <LocationEventsClient stateSlug={state} />;
}
