"use client";

import { useEffect, useState } from "react";
import {
  dashboardPathForRole,
  getAuthSession,
  getProfileRole,
  resolveAdminAccess,
} from "@/lib/auth";

export type AdminAccessStatus = "loading" | "allowed" | "denied";

export function useAdminAccess(): AdminAccessStatus {
  const [status, setStatus] = useState<AdminAccessStatus>("loading");

  useEffect(() => {
    let active = true;

    async function check() {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const auth = await resolveAdminAccess();
        if (!active) return;
        if (auth) {
          setStatus("allowed");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
      }

      if (!active) return;

      const { user } = await getAuthSession();
      if (!user) {
        window.location.assign("/login");
        return;
      }

      const role = await getProfileRole(user.id);
      if (role !== "admin") {
        window.location.assign(dashboardPathForRole(role));
      }
      setStatus("denied");
    }

    check();

    return () => {
      active = false;
    };
  }, []);

  return status;
}
