"use client";

import { useEffect } from "react";

export default function ManageEventsPage() {
  useEffect(() => {
    window.location.replace("/dashboard/organizer");
  }, []);

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <p className="goldEyebrow">Organizer Dashboard</p>
        <h1>Redirecting...</h1>
        <p className="muted">Opening your organizer dashboard.</p>
      </section>
    </main>
  );
}
