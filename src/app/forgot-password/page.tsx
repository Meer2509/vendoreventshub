"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleResetPassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "https://www.vendoreventshub.com/reset-password",
        }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="forgotPage">
      <section className="forgotHero">
        <div>
          <p className="eyebrow">
            Account Recovery
          </p>

          <h1>
            Forgot your password?
          </h1>

          <p className="heroText">
            Enter your email and we’ll send
            you a secure password reset link
            so you can access your
            VendorEventsHub account again.
          </p>

          <div className="trustRow">
            <span>Secure Reset</span>
            <span>Fast Access</span>
            <span>Protected Account</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">
            Secure Recovery
          </p>

          <h3>
            Get back into your account in
            minutes.
          </h3>

          <p>
            Your dashboard, vendor profile,
            organizer tools, saved events,
            and applications will be ready
            when you return.
          </p>
        </div>
      </section>

      <section className="formSection">
        <div className="forgotCard">
          <div className="sectionHead">
            <p className="eyebrow">
              Reset Password
            </p>

            <h2>
              Recover your account.
            </h2>

            <p className="intro">
              Enter the email address
              connected to your account.
            </p>
          </div>

          {success ? (
            <div className="successBox">
              <h3>
                Reset link sent.
              </h3>

              <p>
                Check your email inbox for
                your secure password reset
                link.
              </p>

              <button
                onClick={() =>
                  (window.location.href =
                    "/login")
                }
              >
                Back To Login
              </button>
            </div>
          ) : (
            <form
              onSubmit={
                handleResetPassword
              }
            >
              <label>
                Email Address *
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />
              </label>

              <button
                type="submit"
                className="submitBtn"
                disabled={loading}
              >
                {loading
                  ? "Sending Reset Link..."
                  : "Send Password Reset Link"}
              </button>

              <div className="bottomActions">
                <a href="/login">
                  Back To Login
                </a>

                <a href="/signup">
                  Create Account
                </a>
              </div>
            </form>
          )}
        </div>
      </section>

      <style jsx>{`
        .forgotPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(184, 138, 46, 0.18),
              transparent 34%
            ),
            radial-gradient(
              circle at top right,
              rgba(16, 41, 31, 0.12),
              transparent 30%
            ),
            #f7f1e6;
          color: #10291f;
        }

        .forgotHero,
        .formSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .forgotHero {
          display: grid;
          grid-template-columns:
            1.1fr 0.9fr;
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
          font-size: clamp(
            52px,
            8vw,
            96px
          );
          line-height: 0.88;
          letter-spacing: -0.08em;
          margin: 0;
        }

        h2 {
          font-size: clamp(
            34px,
            5vw,
            62px
          );
          line-height: 0.94;
          letter-spacing: -0.06em;
          margin: 0;
        }

        h3 {
          font-size: 28px;
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .heroText,
        .heroPanel p,
        .intro {
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
          background:
            rgba(
              255,
              255,
              255,
              0.72
            );
          border: 1px solid
            #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .forgotCard {
          background:
            rgba(
              255,
              255,
              255,
              0.88
            );
          border: 1px solid
            #eadfc9;
          border-radius: 36px;
          box-shadow:
            0 30px 90px
            rgba(
              20,
              88,
              63,
              0.13
            );
          backdrop-filter:
            blur(12px);
        }

        .heroPanel {
          padding: 36px;
        }

        .panelBadge {
          display: inline-block;
          background:
            #10291f;
          color: white !important;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 950;
          text-transform:
            uppercase;
          letter-spacing:
            0.09em;
          margin-bottom: 18px;
        }

        .forgotCard {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
        }

        input {
          width: 100%;
          border: 1px solid
            #d8ccb5;
          border-radius: 18px;
          padding: 15px 16px;
          font: inherit;
          background: white;
          color: #10291f;
          margin-top: 8px;
        }

        .submitBtn {
          width: 100%;
          margin-top: 22px;
          height: 62px;
          border: 0;
          background:
            #10291f;
          color: white;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 950;
          cursor: pointer;
        }

        .bottomActions {
          display: flex;
          justify-content:
            space-between;
          margin-top: 22px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bottomActions a {
          color: #10291f;
          text-decoration: none;
          font-weight: 900;
        }

        @media (
          max-width: 900px
        ) {
          .forgotHero {
            grid-template-columns:
              1fr;
          }

          .forgotCard {
            padding:
              30px 18px;
          }

          h1 {
            font-size: 54px;
          }
        }
      `}</style>
    </main>
  );
}