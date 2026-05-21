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
          description="Only accounts with profiles.role = admin can access this area. Other users are redirected to their dashboard."
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = "/dashboard")}
          secondaryLabel="Back to Site"
          onSecondary={() => (window.location.href = "/")}
        />
      </main>
    );
  }

  return <>{children}</>;
}
