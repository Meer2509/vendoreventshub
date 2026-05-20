"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="loginPage">
      <section className="loginHero">
        <div>
          <p className="eyebrow">
            America’s Vendor Event Platform
          </p>

          <h1>Welcome back to VendorEventsHub.</h1>

          <p className="heroText">
            Access your dashboard to manage vendor opportunities, organizer
            tools, event applications, profiles, premium visibility, and smarter
            business growth.
          </p>

          <div className="trustRow">
            <span>Vendor Dashboard</span>
            <span>Organizer Tools</span>
            <span>Premium Visibility</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Marketplace Access</p>

          <h3>
            One premium dashboard for vendors and organizers.
          </h3>

          <p>
            Save events, manage listings, grow visibility, build trust,
            and make smarter event decisions in one place.
          </p>

          <div className="benefitGrid">
            <div>
              <strong>Saved Events</strong>
              <span>Track better opportunities.</span>
            </div>

            <div>
              <strong>Applications</strong>
              <span>Manage vendor requests.</span>
            </div>

            <div>
              <strong>Organizer Tools</strong>
              <span>Create and manage events.</span>
            </div>

            <div>
              <strong>Growth</strong>
              <span>Premium visibility tools.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="formSection">
        <form onSubmit={handleLogin} className="loginCard">
          <div className="sectionHead">
            <p className="eyebrow">Login</p>
            <h2>Access your account.</h2>

            <p className="intro">
              Continue where you left off and manage your business faster.
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

          <button
            type="submit"
            className="submitBtn"
            disabled={loading}
          >
            {loading
              ? "Logging In..."
              : "Login To Dashboard"}
          </button>

          <div className="loginActions">
            <a href="/forgot-password">
              Forgot password?
            </a>

            <a href="/signup">
              Create account
            </a>
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
          background: rgba(255,255,255,.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .loginCard {
          background: rgba(255,255,255,.88);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20,88,63,.13);
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
          letter-spacing: .09em;
          margin-bottom: 18px;
        }

        .benefitGrid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px;
          margin-top: 24px;
        }

        .benefitGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 18px;
        }

        .benefitGrid strong {
          display: block;
          margin-bottom: 6px;
          font-size: 18px;
        }

        .benefitGrid span {
          color: #5f6b66;
          font-size: 14px;
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
          box-shadow: 0 0 0 4px rgba(16,41,31,.08);
        }

        button {
          border: 0;
          border-radius: 999px;
          padding: 15px 24px;
          font-weight: 950;
          cursor: pointer;
          transition: .2s ease;
        }

        button:hover {
          transform: translateY(-2px);
        }

        .ghostBtn {
          width: 100%;
          background: rgba(255,255,255,.65);
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
          opacity: .7;
          cursor: not-allowed;
        }

        .loginActions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .loginActions a {
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

          .benefitGrid {
            grid-template-columns: 1fr;
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