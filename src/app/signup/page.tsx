"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  clearProfileRoleCache,
  dashboardPathForRole,
  getAuthUser,
  getProfileRole,
  normalizeSignupRole,
} from "@/lib/auth";

type AccountType = "vendor" | "organizer";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "vendor" as AccountType,
    city: "",
    state: "",
    website: "",
    phone: "",
    agree: false,
  });

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const { user } = await getAuthUser();
      if (!user) return;

      const role = await getProfileRole(user.id);
      window.location.href = dashboardPathForRole(role);
    }

    redirectIfLoggedIn();
  }, []);

  const redirectPath = useMemo(() => {
    if (formData.accountType === "organizer") return "/dashboard/organizer/setup";
    return "/profile/setup";
  }, [formData.accountType]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.agree) {
      alert("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    const role = normalizeSignupRole(formData.accountType);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          business_name: formData.businessName,
          role,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          business_name: formData.businessName,
          role,
          city: formData.city || null,
          state: formData.state || null,
          website_url: formData.website || null,
          phone: formData.phone || null,
        },
        { onConflict: "id" }
      );
      clearProfileRoleCache(data.user.id);
    }

    setLoading(false);
    alert("Account created successfully.");
    window.location.href = redirectPath;
  }

  return (
    <main className="signupPage">
      <section className="signupHero">
        <div>
          <p className="eyebrow">America’s Vendor Event Platform</p>
          <h1>Create your VendorEventsHub account.</h1>
          <p className="heroText">
            Join the platform built for vendors, organizers, markets, fairs,
            festivals, expos, and event-ready businesses across America.
          </p>

          <div className="trustRow">
            <span>Vendor Accounts: $0</span>
            <span>Organizer Accounts: $0</span>
            <span>Premium Visibility Optional</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Start Smarter</p>
          <h3>
            {formData.accountType === "vendor" &&
              "Create your vendor profile after signup."}
            {formData.accountType === "organizer" &&
              "List your first event after signup."}
          </h3>
          <p>
            VendorEventsHub helps vendors discover opportunities and helps
            organizers reach event-ready businesses.
          </p>
        </div>
      </section>

      <section className="formSection">
        <form onSubmit={handleSignup} className="signupCard">
          <div className="sectionHead">
            <p className="eyebrow">Create Account</p>
            <h2>Choose how you want to use VendorEventsHub.</h2>
          </div>

          <div className="accountTypeGrid">
            {[
              {
                value: "vendor",
                title: "Vendor",
                text: "Find Events — save opportunities, apply smarter, and create your vendor profile.",
                cta: "Create Vendor Profile",
              },
              {
                value: "organizer",
                title: "Organizer",
                text: "List Your Event — reach vendors and manage applications in one place.",
                cta: "Create Organizer Profile",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  formData.accountType === option.value
                    ? "accountTypeCard active"
                    : "accountTypeCard"
                }
                onClick={() =>
                  setFormData({
                    ...formData,
                    accountType: option.value as AccountType,
                  })
                }
              >
                <strong>{option.title}</strong>
                <small>{option.text}</small>
                <span className="accountCta">{option.cta}</span>
              </button>
            ))}
          </div>

          <div className="twoCol">
            <label>
              Full Name *
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </label>

            <label>
              Business / Organization Name *
              <input
                type="text"
                required
                placeholder="Business or Organization Name"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </label>
          </div>

          <div className="twoCol">
            <label>
              City
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </label>

            <label>
              State
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Email Address *
            <input
              type="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </label>

          <div className="twoCol">
            <label>
              Password *
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </label>

            <label>
              Confirm Password *
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </label>
          </div>

          <button
            type="button"
            className="ghostBtn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <div className="twoCol">
            <label>
              Website
              <input
                type="url"
                placeholder="https://yourbusiness.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </label>
          </div>

          <label className="checkRow">
            <input
              type="checkbox"
              required
              checked={formData.agree}
              onChange={(e) =>
                setFormData({ ...formData, agree: e.target.checked })
              }
            />
            <span>I agree to the Terms and Privacy Policy *</span>
          </label>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="loginText">
            Already have an account?{" "}
            <Link href="/login">Choose login</Link> ·{" "}
            <Link href="/login/vendor">Vendor login</Link> ·{" "}
            <Link href="/login/organizer">Organizer login</Link>
          </p>
        </form>
      </section>

      <style jsx>{`
        .signupPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        .signupHero,
        .formSection {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .signupHero {
          min-height: 72vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 36px;
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
          font-size: clamp(50px, 8vw, 96px);
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
        .heroPanel p,
        .loginText {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 760px;
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
        .signupCard {
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

        .signupCard {
          padding: 48px;
        }

        .sectionHead {
          max-width: 780px;
          margin-bottom: 28px;
        }

        .accountTypeGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .accountTypeCard {
          min-height: 140px;
          border-radius: 26px;
          padding: 24px;
          text-align: left;
          cursor: pointer;
          background: #fffaf0;
          border: 1px solid rgba(15, 61, 46, 0.13);
          color: #10291f;
          transition: 0.25s ease;
        }

        .accountTypeCard strong {
          display: block;
          font-size: 25px;
          margin-bottom: 10px;
          letter-spacing: -0.04em;
        }

        .accountTypeCard small {
          display: block;
          color: #5f6b66;
          line-height: 1.5;
          font-weight: 750;
        }

        .accountTypeCard.active {
          background: #10291f;
          color: white;
          border-color: #10291f;
          box-shadow: 0 20px 50px rgba(16, 41, 31, 0.22);
        }

        .accountTypeCard.active small {
          color: rgba(255, 255, 255, 0.76);
        }

        .twoCol {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
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
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 15px 24px;
          font-weight: 950;
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.2);
        }

        .ghostBtn {
          width: fit-content;
          background: rgba(255, 255, 255, 0.65);
          color: #10291f;
          border: 1px solid #d8ccb5;
          margin-bottom: 18px;
        }

        .checkRow {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          color: #5f6b66;
          line-height: 1.5;
        }

        .checkRow input {
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .submitBtn {
          width: 100%;
          margin-top: 8px;
          height: 62px;
          font-size: 17px;
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
          .signupHero,
          .accountTypeGrid,
          .twoCol {
            grid-template-columns: 1fr;
          }

          .signupHero,
          .formSection {
            padding: 54px 16px;
          }

          .signupHero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 54px;
          }

          .signupCard {
            padding: 30px 18px;
          }

          .ghostBtn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}