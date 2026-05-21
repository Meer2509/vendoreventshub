import { supabase } from "@/lib/supabase";

export const EVENT_CATEGORIES = [
  "Festival",
  "Farmers Market",
  "Craft Fair",
  "Flea Market",
  "Food Truck Event",
  "Holiday Market",
  "Expo",
  "Community Fair",
  "Artisan Market",
  "Wellness Event",
  "Pop-Up Market",
  "Trade Show",
];

export const VENDOR_FIT_OPTIONS = [
  "Food",
  "Coffee",
  "Handmade",
  "Jewelry",
  "Art",
  "Wellness",
  "Boutique",
  "Farm",
  "Desserts",
  "Home Goods",
  "Beauty",
  "Pet Products",
];

export type EventFormState = {
  title: string;
  city: string;
  state: string;
  zip_code: string;
  category: string;
  description: string;
  booth_price: string;
  expected_visitors: string;
  event_date: string;
  application_deadline: string;
  booth_size: string;
  electricity: string;
  parking: string;
  food_rules: string;
  vendor_fit: string[];
  image_url: string;
  accepting_vendors: boolean;
};

export function buildEnhancedDescription(event: EventFormState) {
  return `
${event.description}

Vendor Details:
- Application Deadline: ${event.application_deadline || "Not provided"}
- Booth Size: ${event.booth_size || "Not provided"}
- Electricity: ${event.electricity || "Not provided"}
- Parking: ${event.parking || "Not provided"}
- Food Vendor Rules: ${event.food_rules || "Not provided"}
- Best Vendor Fit: ${event.vendor_fit.join(", ") || "Not provided"}
`.trim();
}

export function parseEventDescription(description: string) {
  const [main = "", detailsBlock = ""] = (description || "").split(
    "\n\nVendor Details:"
  );

  const readLine = (label: string) => {
    const match = detailsBlock.match(
      new RegExp(`- ${label}:\\s*(.+?)(?:\\n|$)`, "i")
    );
    const value = match?.[1]?.trim() || "";
    if (value === "Not provided") return "";
    return value;
  };

  const vendorFitRaw = readLine("Best Vendor Fit");

  return {
    description: main.trim(),
    application_deadline: readLine("Application Deadline"),
    booth_size: readLine("Booth Size"),
    electricity: readLine("Electricity"),
    parking: readLine("Parking"),
    food_rules: readLine("Food Vendor Rules"),
    vendor_fit: vendorFitRaw
      ? vendorFitRaw.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  };
}

export async function deleteEventCascade(
  eventId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: eventCheck, error: checkError } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", eventId)
    .eq("created_by", userId)
    .single();

  if (checkError || !eventCheck) {
    return { ok: false, error: "You can only delete events you created." };
  }

  const steps = [
    supabase.from("event_attendance").delete().eq("event_id", eventId),
    supabase.from("saved_events").delete().eq("event_id", eventId),
    supabase.from("reviews").delete().eq("event_id", eventId),
  ];

  for (const step of steps) {
    const { error } = await step;
    if (error) return { ok: false, error: error.message };
  }

  const { error: eventError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("created_by", userId);

  if (eventError) return { ok: false, error: eventError.message };

  return { ok: true };
}

export async function duplicateEventRecord(
  source: Record<string, unknown>,
  userId: string
) {
  const parsed = parseEventDescription(String(source.description || ""));

  const form: EventFormState = {
    title: `${String(source.title || "Event")} (Copy)`,
    city: String(source.city || ""),
    state: String(source.state || ""),
    zip_code: String(source.zip_code || ""),
    category: String(source.category || ""),
    description: parsed.description,
    booth_price: String(source.booth_price ?? ""),
    expected_visitors: String(source.expected_visitors || ""),
    event_date: String(source.event_date || ""),
    application_deadline: parsed.application_deadline,
    booth_size: parsed.booth_size,
    electricity: parsed.electricity,
    parking: parsed.parking,
    food_rules: parsed.food_rules,
    vendor_fit: parsed.vendor_fit,
    image_url: String(source.image_url || ""),
    accepting_vendors: source.accepting_vendors !== false,
  };

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: form.title,
      city: form.city,
      state: form.state,
      zip_code: form.zip_code,
      category: form.category,
      description: buildEnhancedDescription(form),
      booth_price: Number(form.booth_price) || 0,
      expected_visitors: form.expected_visitors,
      event_date: form.event_date,
      image_url: form.image_url,
      is_featured: false,
      accepting_vendors: form.accepting_vendors,
      created_by: userId,
    })
    .select("id")
    .single();

  return { data, error };
}
