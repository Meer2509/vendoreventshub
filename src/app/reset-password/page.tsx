"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully.");
    window.location.href = "/login";
  }

  return (
    <main className="resetPage">
      <section className="resetHero">
        <div>
          <p className="eyebrow">Password Reset</p>
          <h1>Create a new password.</h1>
          <p className="heroText">
            Enter your new password below to secure your VendorEventsHub account
            and return to your dashboard.
          </p>

          <div className="trustRow">
            <span>Secure Update</span>
            <span>Protected Account</span>
            <span>Dashboard Access</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Secure Update</p>
          <h3>Protect your account access.</h3>
          <p>
            After updating your password, you can log back in and continue using
            your vendor and organizer tools.
          </p>
        </div>
      </section>

      <section className="formSection">
        <form onSubmit={handleReset} className="resetCard">
          <p className="eyebrow">New Password</p>
          <h2>Update your password.</h2>

          <label>
            New Password *
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Confirm Password *
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Updating Password..." : "Update Password"}
          </button>

          <p className="loginText">
            Remember your password? <a href="/login">Back to login</a>
          </p>
        </form>
      </section>

      <style jsx>{`
        .resetPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        .resetHero,
        .formSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .resetHero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
          min-height: 58vh;
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
          margin: 0 0 26px;
        }

        h3 {
          font-size: 28px;
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .heroText,
        .heroPanel p,
        .loginText {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 700px;
          margin-top: 24px;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
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
        .resetCard {
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
          color: white;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 18px;
        }

        .resetCard {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px;
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
          width: 100%;
          border: 0;
          border-radius: 999px;
          padding: 16px 24px;
          font-weight: 950;
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
        }

        .ghostBtn {
          background: rgba(255, 255, 255, 0.65);
          color: #10291f;
          border: 1px solid #d8ccb5;
          margin-bottom: 12px;
        }

        .submitBtn {
          background: #10291f;
          color: white;
          min-height: 62px;
          font-size: 16px;
        }

        .submitBtn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .loginText {
          text-align: center;
          font-weight: 800;
          margin: 20px 0 0;
        }

        .loginText a {
          color: #10291f;
          font-weight: 950;
        }

        @media (max-width: 900px) {
          .resetHero {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .resetHero,
          .formSection {
            padding: 54px 16px;
          }

          .resetCard {
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