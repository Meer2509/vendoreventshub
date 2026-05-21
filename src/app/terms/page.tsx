import TrustPageShell from "@/components/TrustPageShell";

export default function TermsPage() {
  return (
    <TrustPageShell
      eyebrow="Terms of Service"
      title="Marketplace terms for vendors and organizers."
      intro="By using VendorEventsHub, you agree to these terms governing accounts, listings, reviews, and platform use."
    >
      <h2>Platform role</h2>
      <p>
        VendorEventsHub provides event discovery and vendor intelligence tools.
        We do not guarantee event attendance, sales results, or organizer
        performance. Vendors are responsible for their own business decisions.
      </p>

      <h2>Accounts and listings</h2>
      <ul>
        <li>Users must provide accurate account and profile information.</li>
        <li>Organizers are responsible for truthful event details and pricing.</li>
        <li>Reviews should reflect genuine vendor experience when submitted.</li>
        <li>We may remove content that violates trust or legal requirements.</li>
      </ul>

      <h2>Payments and advertising</h2>
      <p>
        Paid placements and subscriptions are subject to posted pricing and
        billing terms at checkout.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        VendorEventsHub is provided as-is to the fullest extent permitted by
        law. We are not liable for indirect losses arising from event
        participation decisions.
      </p>

      <p>
        <strong>Last updated:</strong> May 2026
      </p>
    </TrustPageShell>
  );
}
