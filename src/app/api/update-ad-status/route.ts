import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/sendEmail";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

function getEmailContent(status: string, ad: Record<string, unknown>) {
  if (status === "approved") {
    return {
      subject: "Your VendorEventsHub Ad Is Now Live",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h1 style="color:#14583f;">Your ad is live</h1>
          <p>Good news — your VendorEventsHub ad has been approved and is now live.</p>
          <p><strong>${ad.ad_title || "Sponsored Placement"}</strong></p>
          <p>Your placement will run for 30 days based on your approved advertising plan.</p>
          <a href="https://www.vendoreventshub.com"
            style="display:inline-block;background:#14583f;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;">
            View VendorEventsHub
          </a>
        </div>
      `,
    };
  }

  if (status === "rejected") {
    return {
      subject: "Update About Your VendorEventsHub Ad",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h1 style="color:#8b1e1e;">Ad review update</h1>
          <p>Your VendorEventsHub ad was not approved in its current form.</p>
          <p><strong>${ad.ad_title || "Sponsored Placement"}</strong></p>
          <p>Please contact VendorEventsHub if you would like help revising your submission.</p>
          <a href="https://www.vendoreventshub.com/contact"
            style="display:inline-block;background:#14583f;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Contact Support
          </a>
        </div>
      `,
    };
  }

  if (status === "paused") {
    return {
      subject: "Your VendorEventsHub Ad Has Been Paused",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h1 style="color:#14583f;">Your ad has been paused</h1>
          <p>Your VendorEventsHub ad placement has been temporarily paused.</p>
          <p><strong>${ad.ad_title || "Sponsored Placement"}</strong></p>
          <p>If you have questions, please contact VendorEventsHub support.</p>
          <a href="https://www.vendoreventshub.com/contact"
            style="display:inline-block;background:#14583f;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Contact Support
          </a>
        </div>
      `,
    };
  }

  return {
    subject: "VendorEventsHub Ad Status Updated",
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h1 style="color:#14583f;">Your ad status was updated</h1>
        <p>Your ad status is now: <strong>${status}</strong></p>
      </div>
    `,
  };
}

async function verifyAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing admin authorization token." };
  }

  const token = authHeader.slice(7);
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);

  if (userError || !userData.user) {
    return { error: "Invalid or expired session." };
  }

  if (!serviceRoleKey) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { error: "Admin role required." };
  }

  return { supabaseAdmin, user: userData.user };
}

export async function POST(req: Request) {
  try {
    const verified = await verifyAdminRequest(req);
    if ("error" in verified) {
      return NextResponse.json({ error: verified.error }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing ad ID or status." },
        { status: 400 }
      );
    }

    const allowed = ["approved", "rejected", "paused", "pending_review"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const { supabaseAdmin } = verified;

    const { data: ad, error: fetchError } = await supabaseAdmin
      .from("ad_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("ad_orders")
      .update({ approval_status: status })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (ad.customer_email) {
      const email = getEmailContent(status, ad);
      await sendEmail({
        to: ad.customer_email,
        subject: email.subject,
        html: email.html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update ad status error:", error);
    return NextResponse.json(
      { error: "Could not update ad status." },
      { status: 500 }
    );
  }
}
