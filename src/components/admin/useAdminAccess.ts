"use client";

import { useEffect, useState } from "react";
import { requireAdmin } from "@/lib/auth";

export type AdminAccessStatus = "loading" | "allowed" | "denied";

export function useAdminAccess(): AdminAccessStatus {
  const [status, setStatus] = useState<AdminAccessStatus>("loading");

  useEffect(() => {
    async function check() {
      const auth = await requireAdmin();
      setStatus(auth ? "allowed" : "denied");
    }

    check();
  }, []);

  return status;
}
