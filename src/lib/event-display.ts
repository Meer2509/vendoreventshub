export function getVendorScore(event: {
  booth_price?: number | string | null;
  expected_visitors?: number | string | null;
  rating?: number | string | null;
  is_featured?: boolean | null;
  verified_organizer?: boolean | null;
  accepting_vendors?: boolean | null;
}) {
  const booth = Number(event.booth_price || 0);
  const visitors = Number(
    String(event.expected_visitors || "").replace(/\D/g, "") || 0
  );
  const rating = Number(event.rating || 0);
  const featured = Boolean(event.is_featured);
  const verified = Boolean(event.verified_organizer);
  const accepting = event.accepting_vendors !== false;

  let score = 55;

  if (visitors >= 10000) score += 20;
  else if (visitors >= 5000) score += 15;
  else if (visitors >= 1000) score += 10;
  else if (visitors > 0) score += 5;

  if (booth > 0 && booth <= 100) score += 15;
  else if (booth <= 250) score += 10;
  else if (booth <= 500) score += 5;

  if (rating >= 4.8) score += 10;
  else if (rating >= 4.3) score += 7;
  else if (rating >= 3.8) score += 4;

  if (featured) score += 5;
  if (verified) score += 4;
  if (accepting) score += 2;

  return Math.min(score, 99);
}

export function getTrafficLabel(event: { expected_visitors?: number | string | null }) {
  const visitors = Number(
    String(event.expected_visitors || "").replace(/\D/g, "") || 0
  );
  if (visitors >= 10000) return "Very High Traffic";
  if (visitors >= 5000) return "High Traffic";
  if (visitors >= 1000) return "Strong Local Traffic";
  if (visitors > 0) return "Local Opportunity";
  return "Traffic TBD";
}

export function getBoothValue(event: { booth_price?: number | string | null }) {
  const booth = Number(event.booth_price || 0);
  if (!booth) return "Booth Fee TBD";
  if (booth <= 100) return "Excellent Booth Value";
  if (booth <= 250) return "Strong Booth Value";
  if (booth <= 500) return "Moderate Booth Value";
  return "Premium Booth Fee";
}

export function formatEventDate(date: string) {
  if (!date) return "Date coming soon";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
