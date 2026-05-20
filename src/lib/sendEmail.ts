import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function sendEmail({
  to,
  subject,
  html,
  emailType = "general",
  relatedAdId = null,
}: {
  to: string;
  subject: string;
  html: string;
  emailType?: string;
  relatedAdId?: string | null;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn("Email not sent: missing env variables.");

    await supabaseAdmin.from("email_logs").insert({
      email_to: to,
      subject,
      status: "skipped",
      email_type: emailType,
      related_ad_id: relatedAdId,
      error_message: "Missing RESEND_API_KEY or EMAIL_FROM",
    });

    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      await supabaseAdmin.from("email_logs").insert({
        email_to: to,
        subject,
        status: "failed",
        email_type: emailType,
        related_ad_id: relatedAdId,
        error_message: error,
      });

      console.error("Email send failed:", error);
      return;
    }

    await supabaseAdmin.from("email_logs").insert({
      email_to: to,
      subject,
      status: "sent",
      email_type: emailType,
      related_ad_id: relatedAdId,
      error_message: null,
    });
  } catch (error: any) {
    await supabaseAdmin.from("email_logs").insert({
      email_to: to,
      subject,
      status: "failed",
      email_type: emailType,
      related_ad_id: relatedAdId,
      error_message: error?.message || "Unknown email error",
    });

    console.error("Email sending error:", error);
  }
}