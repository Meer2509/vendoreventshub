"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  canAccessOrganizerDashboard,
  canAccessVendorDashboard,
  clearProfileRoleCache,
  getAuthUser,
  getProfileRole,
  type UserRole,
} from "@/lib/auth";

type PortalRole = "vendor" | "organizer";

type RoleLoginFormProps = {
  portalRole: PortalRole;
  eyebrow: string;
  title: string;
  heroText: string;
  panelTitle: string;
  panelText: string;
  trustTags: string[];
  successPath: string;
  alternateLoginHref: string;
  alternateLoginLabel: string;
};

export default function RoleLoginForm({
  portalRole,
  eyebrow,
  title,
  heroText,
  panelTitle,
  panelText,
  trustTags,
  successPath,
  alternateLoginHref,
  alternateLoginLabel,
}: RoleLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      const { user } = await getAuthUser();

      if (!user) {
        setCheckingSession(false);
        return;
      }

      const role = await getProfileRole(user.id);

      if (portalRole === "vendor" && canAccessVendorDashboard(role)) {
        window.location.href = "/dashboard/vendor";
        return;
      }

      if (portalRole === "organizer" && canAccessOrganizerDashboard(role)) {
        window.location.href = "/dashboard/organizer";
        return;
      }

      if (role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setCheckingSession(false);
    }

    checkExistingSession();
  }, [portalRole]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const { user } = await getAuthUser();

    if (!user) {
      setLoading(false);
      alert("Signed in, but session was not found. Please try again.");
      return;
    }

    clearProfileRoleCache(user.id);
    const role: UserRole = await getProfileRole(user.id);

    if (role === "admin") {
      window.location.href = "/admin";
      return;
    }

    if (portalRole === "vendor" && !canAccessVendorDashboard(role)) {
      window.location.href = "/dashboard/organizer";
      return;
    }

    if (portalRole === "organizer" && !canAccessOrganizerDashboard(role)) {
      window.location.href = "/dashboard/vendor";
      return;
    }

    window.location.href = successPath;
  }

  if (checkingSession) {
    return (
      <main className="loginPage">
        <section className="loginHero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>Checking your session...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="loginPage">
      <section className="loginHero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="heroText">{heroText}</p>

          <div className="trustRow">
            {trustTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Marketplace Access</p>
          <h3>{panelTitle}</h3>
          <p>{panelText}</p>
        </div>
      </section>

      <section className="formSection">
        <form onSubmit={handleLogin} className="loginCard">
          <div className="sectionHead">
            <p className="eyebrow">{eyebrow}</p>
            <h2>Access your account.</h2>
            <p className="intro">
              One secure VendorEventsHub account for your role.
            </p>
          </div>

          <label>
            Email Address *
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password *
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="ghostBtn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "Logging In..." : "Login To Dashboard"}
          </button>

          <div className="loginActions">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
            <Link href={alternateLoginHref}>{alternateLoginLabel}</Link>
            <Link href="/login">All login options</Link>
          </div>
        </form>
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
          min-height: 72vh;
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

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        input {
          width: 100%;
          border: 1px solid #d8ccb5;
          border-radius: 18px;
          padding: 15px 16px;
          font: inherit;
          background: white;
          color: #10291f;
        }

        input:focus {
          outline: none;
          border-color: #10291f;
          box-shadow: 0 0 0 4px rgba(16, 41, 31, 0.08);
        }

        button {
          border: 0;
          border-radius: 999px;
          padding: 15px 24px;
          font-weight: 950;
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
        }

        .ghostBtn {
          width: 100%;
          background: rgba(255, 255, 255, 0.65);
          color: #10291f;
          border: 1px solid #d8ccb5;
          margin-bottom: 12px;
        }

        .submitBtn {
          width: 100%;
          background: #10291f;
          color: white;
          height: 62px;
          font-size: 17px;
        }

        .submitBtn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loginActions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 20px;
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

          .loginActions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
