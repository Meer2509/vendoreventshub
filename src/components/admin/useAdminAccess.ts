"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getAuthSession,
  getProfileRole,
  isAdminRole,
} from "@/lib/auth";

export type AdminAccessStatus = "loading" | "allowed" | "denied";

export function useAdminAccess(): AdminAccessStatus {
  const [status, setStatus] = useState<AdminAccessStatus>("loading");

  useEffect(() => {
    let active = true;

    async function verify() {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (!active) return;

        const { user } = await getAuthSession();
        if (!user) {
          if (attempt < 9) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            continue;
          }
          setStatus("denied");
          return;
        }

        const role = await getProfileRole(user.id);
        if (isAdminRole(role)) {
          setStatus("allowed");
          return;
        }

        setStatus("denied");
        return;
      }
    }

    verify();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setStatus("denied");
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        verify();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return status;
}
