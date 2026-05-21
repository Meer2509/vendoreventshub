"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardRouterPage() {
  useEffect(() => {
    async function routeUser() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      const role = profileData?.role || "vendor";

      if (role === "organizer") {
        window.location.href = "/dashboard/organizer";
        return;
      }

      if (role === "admin") {
        window.location.href = "/dashboard/admin";
        return;
      }

      window.location.href = "/dashboard/vendor";
    }

    routeUser();
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
        <p style={{ color: "#b88a2e", fontWeight: 900 }}>
          VendorEventsHub
        </p>
        <h1>Opening your dashboard...</h1>
        <p>Please wait while we load the right dashboard for your account.</p>
      </div>
    </main>
  );
}