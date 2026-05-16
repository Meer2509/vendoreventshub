"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type AccountType = "vendor" | "organizer" | "both";

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

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          business_name: formData.businessName,
          role: formData.accountType,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: formData.email,
        full_name: formData.fullName,
        business_name: formData.businessName,
        role: formData.accountType,
        city: formData.city || null,
        state: formData.state || null,
        website_url: formData.website || null,
        phone: formData.phone || null,
      });
    }

    setLoading(false);
    alert("Account created successfully.");
    window.location.href = "/dashboard";
  }

  return (
    <main className="signupLuxuryPage">
      <section className="signupLuxuryCard">
        <p className="signupEyebrow">FOUNDING MEMBER ACCESS</p>

        <h1>Create Your VendorEventsHub Account</h1>

        <p className="signupIntro">
          Join the premium event intelligence platform for vendors and organizers.
          Choose your account type and start discovering smarter event opportunities.
        </p>

        <form onSubmit={handleSignup} className="signupForm">
          <div className="signupField">
            <label>
              Account Type <span>*</span>
            </label>

            <div className="accountTypeGrid">
              {[
                {
                  value: "vendor",
                  title: "Vendor",
                  text: "Find events, save opportunities, and apply smarter.",
                },
                {
                  value: "organizer",
                  title: "Organizer",
                  text: "List events, attract vendors, and manage applications.",
                },
                {
                  value: "both",
                  title: "Both",
                  text: "Use vendor and organizer tools in one account.",
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
                </button>
              ))}
            </div>
          </div>

          <div className="signupTwoCol">
            <div className="signupField">
              <label>
                Full Name <span>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="signupField">
              <label>
                Business / Organization Name <span>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Business or Organization Name"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="signupTwoCol">
            <div className="signupField">
              <label>City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div className="signupField">
              <label>State</label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>
          </div>

          <div className="signupField">
            <label>
              Email Address <span>*</span>
            </label>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="signupTwoCol">
            <div className="signupField">
              <label>
                Password <span>*</span>
              </label>
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
            </div>

            <div className="signupField">
              <label>
                Confirm Password <span>*</span>
              </label>
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
            </div>
          </div>

          <button
            type="button"
            className="signupGhostBtn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <div className="signupTwoCol">
            <div className="signupField">
              <label>Website</label>
              <input
                type="url"
                placeholder="https://yourbusiness.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>

            <div className="signupField">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <label className="signupCheck">
            <input
              type="checkbox"
              required
              checked={formData.agree}
              onChange={(e) =>
                setFormData({ ...formData, agree: e.target.checked })
              }
            />
            <span>
              I agree to the Terms and Privacy Policy <b>*</b>
            </span>
          </label>

          <button type="submit" className="signupSubmit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Premium Account"}
          </button>

          <p className="signupLoginText">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </form>
      </section>

      <style jsx>{`
        .signupLuxuryPage {
          min-height: 100vh;
          padding: 70px 20px;
          background:
            radial-gradient(circle at top left, rgba(214, 179, 106, 0.18), transparent 30%),
            linear-gradient(135deg, #fffaf0, #f7f2e8);
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .signupLuxuryCard {
          width: 100%;
          max-width: 980px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 61, 46, 0.1);
          border-radius: 38px;
          padding: 56px;
          box-shadow: 0 28px 85px rgba(15, 61, 46, 0.12);
        }

        .signupEyebrow {
          color: #b8872f;
          text-transform: uppercase;
          letter-spacing: 5px;
          font-size: 12px;
          font-weight: 900;
          margin: 0 0 18px;
        }

        h1 {
          color: #0b1f18;
          font-size: clamp(42px, 6vw, 64px);
          line-height: 1;
          letter-spacing: -2px;
          margin: 0;
        }

        .signupIntro {
          margin: 24px 0 38px;
          color: #526058;
          font-size: 18px;
          line-height: 1.7;
          max-width: 780px;
        }

        .signupForm {
          display: grid;
          gap: 24px;
        }

        .signupField {
          display: grid;
          gap: 10px;
        }

        .signupField label {
          color: #0f3d2e;
          font-weight: 900;
          font-size: 16px;
        }

        .signupField label span,
        .signupCheck b {
          color: #c1121f;
        }

        .signupField input {
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

        .signupField input:focus {
          border-color: #0f3d2e;
          box-shadow: 0 0 0 4px rgba(15, 61, 46, 0.08);
        }

        .signupTwoCol {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .accountTypeGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .accountTypeCard {
          min-height: 132px;
          border-radius: 24px;
          padding: 22px;
          text-align: left;
          cursor: pointer;
          background: #fffaf0;
          border: 1px solid rgba(15, 61, 46, 0.13);
          color: #0b1f18;
          transition: 0.25s ease;
        }

        .accountTypeCard strong {
          display: block;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .accountTypeCard small {
          display: block;
          color: #526058;
          font-size: 14px;
          line-height: 1.45;
        }

        .accountTypeCard.active {
          background: linear-gradient(135deg, #0f3d2e, #1f6f54);
          color: #fffaf0;
          border-color: #0f3d2e;
          box-shadow: 0 20px 45px rgba(15, 61, 46, 0.2);
        }

        .accountTypeCard.active small {
          color: #efe7d6;
        }

        .signupGhostBtn {
          width: fit-content;
          border-radius: 999px;
          border: 1px solid rgba(15, 61, 46, 0.16);
          background: #fffaf0;
          color: #0f3d2e;
          padding: 13px 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .signupCheck {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          color: #526058;
          font-weight: 800;
          line-height: 1.5;
        }

        .signupCheck input {
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .signupSubmit {
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

        .signupSubmit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .signupLoginText {
          text-align: center;
          color: #526058;
          margin: 0;
          font-weight: 700;
        }

        .signupLoginText a {
          color: #0f3d2e;
          font-weight: 900;
        }

        @media (max-width: 800px) {
          .signupLuxuryPage {
            padding: 28px 14px;
          }

          .signupLuxuryCard {
            padding: 28px 18px;
            border-radius: 28px;
          }

          h1 {
            font-size: 38px;
            letter-spacing: -1px;
          }

          .signupIntro {
            font-size: 15px;
            margin-bottom: 28px;
          }

          .accountTypeGrid,
          .signupTwoCol {
            grid-template-columns: 1fr;
          }

          .accountTypeCard {
            min-height: auto;
            padding: 20px;
          }

          .accountTypeCard strong {
            font-size: 22px;
          }

          .signupField input {
            height: 58px;
          }

          .signupGhostBtn,
          .signupSubmit {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}