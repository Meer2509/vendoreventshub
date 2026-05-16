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
          city: formData.city,
          state: formData.state,
          website_url: formData.website,
          phone: formData.phone,
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

    alert("Account created successfully. Please check your email if confirmation is required.");
    window.location.href = "/dashboard";
  }

  return (
    <main className="authPage">
      <div className="authCard" style={{ maxWidth: "820px" }}>
        <div className="goldEyebrow">FOUNDING MEMBER ACCESS</div>

        <h1>Create Your VendorEventsHub Account</h1>

        <p className="authSubtitle">
          Join the premium event intelligence platform for vendors and organizers.
          Choose your account type, build trust, and start discovering smarter event
          opportunities.
        </p>

        <form onSubmit={handleSignup} className="authForm">
          <div style={{ display: "grid", gap: "14px" }}>
            <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
              Account Type <span style={{ color: "#c1121f" }}>*</span>
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
              }}
            >
              {[
                {
                  value: "vendor",
                  title: "Vendor",
                  text: "Find profitable events, save opportunities, and apply smarter.",
                },
                {
                  value: "organizer",
                  title: "Organizer",
                  text: "List events, attract vendors, and manage applications.",
                },
                {
                  value: "both",
                  title: "Both",
                  text: "Use vendor tools and organizer tools in one account.",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      accountType: option.value as AccountType,
                    })
                  }
                  style={{
                    textAlign: "left",
                    borderRadius: "24px",
                    padding: "20px",
                    cursor: "pointer",
                    border:
                      formData.accountType === option.value
                        ? "2px solid #0f3d2e"
                        : "1px solid rgba(15,61,46,0.12)",
                    background:
                      formData.accountType === option.value
                        ? "linear-gradient(135deg, #0f3d2e, #1f6f54)"
                        : "#fffaf0",
                    color:
                      formData.accountType === option.value
                        ? "#fffaf0"
                        : "#0b1f18",
                    boxShadow:
                      formData.accountType === option.value
                        ? "0 18px 45px rgba(15,61,46,0.18)"
                        : "none",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "20px" }}>
                    {option.title}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      marginTop: "8px",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      opacity: 0.78,
                    }}
                  >
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
            Full Name <span style={{ color: "#c1121f" }}>*</span>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </label>

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
            Business / Organization Name <span style={{ color: "#c1121f" }}>*</span>
            <input
              type="text"
              placeholder="Business or Organization Name"
              required
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
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

            <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
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

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
            Email Address <span style={{ color: "#c1121f" }}>*</span>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </label>

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
            Password <span style={{ color: "#c1121f" }}>*</span>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                style={{ flex: 1 }}
              />

              <button
                type="button"
                className="outlineBtn"
                onClick={() => setShowPassword(!showPassword)}
                style={{ minWidth: "110px" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
            Confirm Password <span style={{ color: "#c1121f" }}>*</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </label>

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
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

          <label style={{ color: "#0f3d2e", fontWeight: 900 }}>
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

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              color: "#526058",
              lineHeight: "1.5",
              fontWeight: 700,
            }}
          >
            <input
              type="checkbox"
              required
              checked={formData.agree}
              onChange={(e) =>
                setFormData({ ...formData, agree: e.target.checked })
              }
              style={{ width: "20px", height: "20px", marginTop: "2px" }}
            />
            <span>
              I agree to the Terms and Privacy Policy{" "}
              <span style={{ color: "#c1121f" }}>*</span>
            </span>
          </label>

          <button type="submit" className="goldBtn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Premium Account"}
          </button>

          <p className="authSubtitle" style={{ marginBottom: 0, textAlign: "center" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#0f3d2e", fontWeight: 900 }}>
              Login here
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}