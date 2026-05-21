"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthUser, getProfileRole, dashboardPathForRole } from "@/lib/auth";

export default function LoginChooserPage() {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const { user } = await getAuthUser();

      if (user) {
        const role = await getProfileRole(user.id);
        window.location.href = dashboardPathForRole(role);
        return;
      }

      setCheckingSession(false);
    }

    redirectIfLoggedIn();
  }, []);

  if (checkingSession) {
    return (
      <main className="loginPage">
        <section className="loginHero">
          <p className="eyebrow">VendorEventsHub</p>
          <h1>Checking your session...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="loginPage">
      <section className="loginHero">
        <div>
          <p className="eyebrow">America&apos;s Vendor Event Platform</p>
          <h1>Welcome back to VendorEventsHub.</h1>
          <p className="heroText">
            Choose how you want to sign in. Vendors and organizers use the same
            secure account system with role-based dashboards.
          </p>

          <div className="trustRow">
            <span>Vendor Dashboard</span>
            <span>Organizer Dashboard</span>
            <span>One Auth System</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Secure Login</p>
          <h3>Pick the login portal that matches your role.</h3>
          <p>
            This keeps vendors and organizers on the right dashboard without
            mixing tools or permissions.
          </p>
        </div>
      </section>

      <section className="formSection">
        <div className="loginCard">
          <div className="sectionHead">
            <p className="eyebrow">Login</p>
            <h2>How are you signing in today?</h2>
            <p className="intro">
              Select your account type to continue to the correct login page.
            </p>
          </div>

          <div className="roleGrid">
            <Link href="/login/vendor" className="roleCard">
              <strong>Vendor Login</strong>
              <span>Find Events — save opportunities, apply, and manage your vendor profile.</span>
            </Link>

            <Link href="/login/organizer" className="roleCard gold">
              <strong>Organizer Login</strong>
              <span>List Your Event — manage listings, applications, and organizer profile.</span>
            </Link>
          </div>

          <div className="loginActions">
            <Link href="/signup">Create account</Link>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .loginPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        .loginHero,
        .formSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .loginHero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
          min-height: 60vh;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        h1 {
          font-size: clamp(52px, 8vw, 96px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
        }

        h2 {
          font-size: clamp(34px, 5vw, 62px);
          line-height: 0.94;
          letter-spacing: -0.06em;
          margin: 0;
        }

        h3 {
          font-size: 28px;
          letter-spacing: -0.045em;
          line-height: 1.05;
          margin: 0;
        }

        .heroText,
        .intro,
        .heroPanel p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 720px;
          margin-top: 24px;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .trustRow span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .loginCard {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
        }

        .panelBadge {
          display: inline-block;
          background: #10291f;
          color: white !important;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 18px;
        }

        .loginCard {
          max-width: 760px;
          margin: 0 auto;
          padding: 48px;
        }

        .sectionHead {
          margin-bottom: 26px;
        }

        .roleGrid {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }

        .roleGrid :global(.roleCard) {
          display: grid;
          gap: 8px;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #ded0b5;
          background: #f7f1e6;
          text-decoration: none;
          color: #10291f;
          transition: 0.2s ease;
        }

        .roleGrid :global(.roleCard:hover) {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.12);
        }

        .roleGrid :global(.roleCard strong) {
          font-size: 22px;
        }

        .roleGrid :global(.roleCard span) {
          color: #5f6b66;
          line-height: 1.6;
        }

        .roleGrid :global(.roleCard.gold) {
          background: #10291f;
          color: white;
          border-color: #10291f;
        }

        .roleGrid :global(.roleCard.gold span) {
          color: rgba(255, 255, 255, 0.82);
        }

        .loginActions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .loginActions :global(a) {
          color: #10291f;
          font-weight: 900;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .loginHero {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 44px;
          }

          .loginHero,
          .formSection {
            padding: 54px 16px;
          }

          .loginCard {
            padding: 30px 18px;
          }

          h1 {
            font-size: 54px;
          }
        }
      `}</style>
    </main>
  );
}
