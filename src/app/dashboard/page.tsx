"use client";

import { useEffect } from "react";
import { routeDashboardByRole } from "@/lib/auth";

export default function DashboardRouterPage() {
  useEffect(() => {
    routeDashboardByRole();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f1e6",
        color: "#10291f",
        fontFamily: "inherit",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ color: "#b88a2e", fontWeight: 900 }}>VendorEventsHub</p>
        <h1>Opening your dashboard...</h1>
        <p>Please wait while we load the right dashboard for your account.</p>
      </div>
    </main>
  );
}
