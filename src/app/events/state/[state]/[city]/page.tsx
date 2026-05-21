import LocationEventsClient from "@/components/LocationEventsClient";
import { buildPageMetadata } from "@/lib/seo";
import { formatCityLabel, getStateBySlug } from "@/lib/locations";

type Props = { params: Promise<{ state: string; city: string }> };

export async function generateMetadata({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;
  const state = getStateBySlug(stateSlug);
  const cityLabel = formatCityLabel(citySlug);

  if (!state) {
    return buildPageMetadata({
      title: "Vendor Events by City",
      path: `/events/${stateSlug}/${citySlug}`,
    });
  }

  return buildPageMetadata({
    title: `Vendor Events in ${cityLabel}, ${state.abbr}`,
    description: `Discover vendor events in ${cityLabel}, ${state.name}. Compare booth fees, traffic signals, and organizer details before you apply.`,
    path: `/events/${state.slug}/${citySlug}`,
    keywords: [
      `vendor events in ${cityLabel}`,
      `craft fairs ${cityLabel}`,
      `farmers market vendors ${cityLabel}`,
      "vendor events near me",
    ],
  });
}

export default async function CityEventsPage({ params }: Props) {
  const { state, city } = await params;
  return <LocationEventsClient stateSlug={state} citySlug={city} />;
}
