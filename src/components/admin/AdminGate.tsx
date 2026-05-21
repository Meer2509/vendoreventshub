"use client";

import PremiumEmptyState from "@/components/PremiumEmptyState";
import { useAdminAccess } from "./useAdminAccess";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const status = useAdminAccess();

  if (status === "loading") {
    return (
      <main className="adminPage">
        <section className="adminHero">
          <p className="adminEyebrow">VendorEventsHub Admin</p>
          <h1>Loading command center...</h1>
        </section>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="adminPage">
        <PremiumEmptyState
          eyebrow="Access Denied"
          title="Admin access required"
          description="Sign in with an account where profiles.role = admin. Navigation does not sign you out — use Log In if your session expired."
          actionLabel="Log In"
          onAction={() => (window.location.href = "/login")}
          secondaryLabel="Go to Dashboard"
          onSecondary={() => (window.location.href = "/dashboard")}
        />
      </main>
    );
  }

  return <>{children}</>;
}
