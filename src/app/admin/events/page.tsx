export default function AdminEventsPage() {
    return (
      <main style={{ minHeight: "100vh", background: "#f7f3ea", padding: 40 }}>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 30,
            padding: 40,
            color: "#10291f",
          }}
        >
          <p style={{ color: "#14583f", fontWeight: 900 }}>VendorEventsHub Admin</p>
          <h1 style={{ fontSize: 56, margin: 0 }}>Events Management</h1>
          <p style={{ color: "#5f6b66", fontSize: 18 }}>
            This page will manage event listings, organizer submissions, featured
            events, approvals, and event visibility.
          </p>
        </section>
      </main>
    );
  }