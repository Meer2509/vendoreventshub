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
    <main className="loginLuxuryPage">
      <section className="loginLuxuryCard">
        <div className="loginPanel">
          <p className="loginEyebrow">PREMIUM MEMBER ACCESS</p>

          <h1>Welcome Back.</h1>

          <p className="loginIntro">
            Log in to manage your saved events, applications, organizer tools,
            vendor profile, and premium growth dashboard.
          </p>

          <form onSubmit={handleLogin} className="loginForm">
            <div className="loginField">
              <label>
                Email Address <span>*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="loginField">
              <label>
                Password <span>*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="loginGhostBtn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>

            <button type="submit" className="loginSubmit" disabled={loading}>
              {loading ? "Logging In..." : "Login To Dashboard"}
            </button>

            <p className="loginSignupText">
              New to VendorEventsHub? <a href="/signup">Create account</a>
            </p>
          </form>
        </div>

        <div className="loginSidePanel">
          <p className="sideBadge">VendorEventsHub</p>
          <h2>One dashboard for vendors and organizers.</h2>

          <div className="loginBenefitGrid">
            <div>
              <strong>Saved Events</strong>
              <span>Track opportunities before applying.</span>
            </div>

            <div>
              <strong>Applications</strong>
              <span>Manage requested and approved events.</span>
            </div>

            <div>
              <strong>Organizer Tools</strong>
              <span>Create events and attract vendors.</span>
            </div>

            <div>
              <strong>Growth</strong>
              <span>Premium visibility and sponsored placement.</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .loginLuxuryPage {
          min-height: 100vh;
          padding: 70px 20px;
          background:
            radial-gradient(circle at top left, rgba(214, 179, 106, 0.18), transparent 30%),
            linear-gradient(135deg, #fffaf0, #f7f2e8);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loginLuxuryCard {
          width: 100%;
          max-width: 1080px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 61, 46, 0.1);
          border-radius: 40px;
          padding: 22px;
          box-shadow: 0 28px 85px rgba(15, 61, 46, 0.12);
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 22px;
        }

        .loginPanel {
          padding: 44px;
        }

        .loginEyebrow {
          color: #b8872f;
          text-transform: uppercase;
          letter-spacing: 5px;
          font-size: 12px;
          font-weight: 900;
          margin: 0 0 18px;
        }

        h1 {
          color: #0b1f18;
          font-size: clamp(46px, 6vw, 72px);
          line-height: 1;
          letter-spacing: -2px;
          margin: 0;
        }

        .loginIntro {
          margin: 22px 0 34px;
          color: #526058;
          font-size: 18px;
          line-height: 1.7;
        }

        .loginForm {
          display: grid;
          gap: 20px;
        }

        .loginField {
          display: grid;
          gap: 10px;
        }

        .loginField label {
          color: #0f3d2e;
          font-weight: 900;
          font-size: 16px;
        }

        .loginField span {
          color: #c1121f;
        }

        .loginField input {
          width: 100%;
          height: 62px;
          border-radius: 18px;
          border: 1px solid rgba(15, 61, 46, 0.13);
          background: #fffaf0;
          padding: 0 20px;
          font-size: 16px;
          color: #0b1f18;
          outline: none;
        }

        .loginField input:focus {
          border-color: #0f3d2e;
          box-shadow: 0 0 0 4px rgba(15, 61, 46, 0.08);
        }

        .loginGhostBtn {
          width: fit-content;
          border-radius: 999px;
          border: 1px solid rgba(15, 61, 46, 0.16);
          background: #fffaf0;
          color: #0f3d2e;
          padding: 13px 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .loginSubmit {
          height: 64px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f3d2e, #1f6f54);
          color: white;
          font-weight: 900;
          font-size: 17px;
          cursor: pointer;
          box-shadow: 0 18px 42px rgba(15, 61, 46, 0.2);
        }

        .loginSubmit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .loginSignupText {
          text-align: center;
          color: #526058;
          margin: 0;
          font-weight: 700;
        }

        .loginSignupText a {
          color: #0f3d2e;
          font-weight: 900;
        }

        .loginSidePanel {
          border-radius: 30px;
          padding: 38px;
          background:
            radial-gradient(circle at top right, rgba(214, 179, 106, 0.22), transparent 36%),
            linear-gradient(135deg, #0f3d2e, #1f6f54);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 560px;
        }

        .sideBadge {
          width: fit-content;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          padding: 10px 16px;
          color: #efe7d6;
          font-weight: 900;
          margin: 0;
        }

        .loginSidePanel h2 {
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -1px;
          margin: 34px 0;
          max-width: 460px;
        }

        .loginBenefitGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .loginBenefitGrid div {
          border-radius: 22px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.13);
        }

        .loginBenefitGrid strong {
          display: block;
          color: #fffaf0;
          font-size: 17px;
          margin-bottom: 8px;
        }

        .loginBenefitGrid span {
          color: #efe7d6;
          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .loginLuxuryPage {
            padding: 28px 14px;
            align-items: flex-start;
          }

          .loginLuxuryCard {
            grid-template-columns: 1fr;
            border-radius: 30px;
            padding: 16px;
          }

          .loginPanel {
            padding: 26px 8px;
          }

          h1 {
            font-size: 42px;
            letter-spacing: -1px;
          }

          .loginIntro {
            font-size: 15px;
          }

          .loginGhostBtn,
          .loginSubmit {
            width: 100%;
          }

          .loginSidePanel {
            min-height: auto;
            padding: 28px;
            border-radius: 26px;
          }

          .loginBenefitGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}