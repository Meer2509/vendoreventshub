import TrustPageShell from "@/components/TrustPageShell";
import Link from "next/link";

export default function ContactPage() {
  return (
    <TrustPageShell
      eyebrow="Contact"
      title="Talk with the VendorEventsHub team."
      intro="Questions about vendor accounts, organizer listings, advertising, or launch partnerships? Reach out and we will respond as quickly as possible."
    >
      <h2>Marketplace support</h2>
      <p>
        Email:{" "}
        <a href="mailto:hello@vendoreventshub.com">hello@vendoreventshub.com</a>
      </p>
      <p>
        For organizer listing help, include your event name, dates, location,
        and booth fee details so we can assist faster.
      </p>

      <h2>Launch focus</h2>
      <p>
        VendorEventsHub is launching in Connecticut and expanding nationwide.
        Founding vendors and founding organizers receive priority onboarding
        support during early marketplace growth.
      </p>

      <h2>Quick links</h2>
      <ul>
        <li>
          <Link href="/events">Explore vendor events</Link>
        </li>
        <li>
          <Link href="/create-event">List your event</Link>
        </li>
        <li>
          <Link href="/advertise">Advertise on VendorEventsHub</Link>
        </li>
        <li>
          <Link href="/pricing">View pricing</Link>
        </li>
      </ul>
    </TrustPageShell>
  );
}
