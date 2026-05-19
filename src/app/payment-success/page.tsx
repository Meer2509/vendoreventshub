import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>Payment Received</div>

        <h1 style={styles.title}>Your premium placement request is confirmed.</h1>

        <p style={styles.text}>
          Thank you for choosing VendorEventsHub. Your payment was securely
          processed, and your advertising placement will move into review and
          activation.
        </p>

        <div style={styles.box}>
          <p>✓ Secure Stripe payment completed</p>
          <p>✓ Invoice/receipt confirmation will be sent</p>
          <p>✓ Placement review begins next</p>
        </div>

        <Link href="/dashboard" style={styles.button}>
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #18213b 0%, #08111f 45%, #05070d 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    maxWidth: 720,
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 32,
    padding: 42,
    background: "rgba(255,255,255,.07)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 30px 90px rgba(0,0,0,.45)",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    border: "1px solid rgba(215,192,138,.45)",
    borderRadius: 999,
    padding: "8px 16px",
    color: "#d7c08a",
    fontSize: 13,
    marginBottom: 20,
  },
  title: {
    fontSize: "clamp(34px, 6vw, 64px)",
    lineHeight: 1,
    letterSpacing: "-0.05em",
    margin: "0 0 18px",
  },
  text: {
    color: "rgba(255,255,255,.72)",
    fontSize: 18,
    lineHeight: 1.6,
  },
  box: {
    textAlign: "left",
    margin: "28px auto",
    padding: 22,
    borderRadius: 20,
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.85)",
  },
  button: {
    display: "inline-block",
    background: "#d7c08a",
    color: "#07101e",
    padding: "14px 22px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 700,
  },
};