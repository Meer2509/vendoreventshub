import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { ad_id, event_type, placement, page_url, visitor_id } = body;

    if (!ad_id || !event_type) {
      return NextResponse.json(
        { error: "Missing ad_id or event_type." },
        { status: 400 }
      );
    }

    await supabaseAdmin.from("ad_analytics").insert({
      ad_id,
      event_type,
      placement: placement || "",
      page_url: page_url || "",
      visitor_id: visitor_id || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad tracking error:", error);

    return NextResponse.json(
      { error: "Ad tracking failed." },
      { status: 500 }
    );
  }
}