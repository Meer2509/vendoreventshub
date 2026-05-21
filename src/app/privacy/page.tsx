import TrustPageShell from "@/components/TrustPageShell";

export default function PrivacyPage() {
  return (
    <TrustPageShell
      eyebrow="Privacy Policy"
      title="Your privacy matters on VendorEventsHub."
      intro="This policy explains how VendorEventsHub collects, uses, and protects information when you browse events, create profiles, or use marketplace tools."
    >
      <h2>Information we collect</h2>
      <ul>
        <li>Account details such as name, email, and business information.</li>
        <li>Profile content you choose to publish as a vendor or organizer.</li>
        <li>Event listing details submitted by organizers.</li>
        <li>Basic usage data to improve marketplace performance and security.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Operate vendor and organizer dashboards.</li>
        <li>Display public marketplace listings and profiles.</li>
        <li>Process advertising and payment workflows when enabled.</li>
        <li>Improve trust, search relevance, and platform reliability.</li>
      </ul>

      <h2>Data sharing</h2>
      <p>
        We do not sell personal data. Service providers (such as hosting,
        authentication, and payment processors) may process data only to
        operate the platform.
      </p>

      <h2>Your choices</h2>
      <p>
        You may update profile details from your dashboard and request account
        support by contacting hello@vendoreventshub.com.
      </p>

      <p>
        <strong>Last updated:</strong> May 2026
      </p>
    </TrustPageShell>
  );
}
