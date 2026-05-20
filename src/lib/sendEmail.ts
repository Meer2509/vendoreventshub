export async function sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      console.warn("Email not sent: missing env variables.");
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
        console.error("Email send failed:", await response.text());
      }
    } catch (error) {
      console.error("Email sending error:", error);
    }
  }