"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
  "Food & Beverage",
  "Handmade Goods",
  "Health & Wellness",
  "Beauty & Skincare",
  "Home Decor",
  "Artisan Products",
  "Clothing & Apparel",
  "Jewelry",
  "Food Truck",
  "Service Business",
  "Farm Products",
  "Coffee / Drinks",
];

export default function VendorProfileSetupPage() {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [profile, setProfile] = useState({
    business_name: "",
    slug: "",
    category: "",
    short_description: "",
    full_description: "",
    website: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    phone: "",
    city: "",
    state: "",
    logo_url: "",
    banner_url: "",
    years_in_business: "",
  });

  useEffect(() => {
    async function loadExistingProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          business_name: data.business_name || "",
          slug: data.slug || "",
          category: data.category || "",
          short_description: data.short_description || "",
          full_description: data.full_description || "",
          website: data.website || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          facebook: data.facebook || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          logo_url: data.logo_url || "",
          banner_url: data.banner_url || "",
          years_in_business: data.years_in_business || "",
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
        if (data.banner_url) setBannerPreview(data.banner_url);
      }
    }

    loadExistingProfile();
  }, []);

  const profileScore = useMemo(() => {
    let score = 15;
    if (profile.business_name) score += 15;
    if (profile.category) score += 10;
    if (profile.short_description) score += 15;
    if (profile.full_description) score += 15;
    if (profile.logo_url) score += 15;
    if (profile.banner_url) score += 10;
    if (profile.website || profile.instagram || profile.tiktok || profile.facebook)
      score += 5;
    return Math.min(score, 100);
  }, [profile]);

  function updateField(field: string, value: string) {
    setProfile({ ...profile, [field]: value });
  }

  async function uploadImage(file: File, bucket: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file, "vendor-logos");
    if (url) {
      updateField("logo_url", url);
      setLogoPreview(url);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file, "vendor-banners");
    if (url) {
      updateField("banner_url", url);
      setBannerPreview(url);
    }
  }

  async function saveVendorProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    const cleanSlug =
      profile.slug ||
      profile.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("vendor_profiles").upsert(
      {
        user_id: userData.user.id,
        ...profile,
        slug: cleanSlug,
      },
      { onConflict: "user_id" }
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Vendor profile saved successfully!");
    window.location.href = `/vendors/${cleanSlug}`;
  }

  return (
    <main className="profilePage">
      <section className="hero">
        <div>
          <p className="eyebrow">Vendor Profile Setup</p>
          <h1>Build a premium vendor profile organizers can trust.</h1>
          <p className="heroText">
            Create a polished public business profile with your logo, banner,
            story, links, location, category, and vendor identity.
          </p>

          <div className="heroActions">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("profile-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start Profile
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => (window.location.href = "/dashboard/vendor")}
            >
              Back To Dashboard
            </button>
          </div>

          <div className="trustRow">
            <span>Organizer Trust</span>
            <span>Vendor Discovery</span>
            <span>Premium Public Profile</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Profile Strength</p>
          <div className="scoreCircle">{profileScore}</div>
          <h3>{profileScore >= 80 ? "Strong profile" : "Build more trust"}</h3>
          <p>
            Complete profiles help organizers understand your business faster
            and improve your visibility inside VendorEventsHub.
          </p>
        </div>
      </section>

      <section className="previewSection">
        <div className="sectionHead">
          <p className="eyebrow">Live Profile Preview</p>
          <h2>Your vendor brand should look premium before organizers contact you.</h2>
        </div>

        <article className="profilePreview">
          <div
            className="banner"
            style={{
              backgroundImage: `url(${
                bannerPreview ||
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
              })`,
            }}
          />

          <div className="previewBody">
            <img
              src={
                logoPreview ||
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop"
              }
              alt="Vendor logo preview"
              className="logo"
            />

            <div>
              <p className="eyebrow">{profile.category || "Vendor Category"}</p>
              <h3>{profile.business_name || "Your Business Name"}</h3>
              <p>
                {profile.short_description ||
                  "Your short business description will appear here."}
              </p>

              <div className="pillGrid">
                <span>{profile.city || "City"}, {profile.state || "State"}</span>
                <span>{profile.years_in_business || "Years in business"}</span>
                <span>{profileScore}% Profile Strength</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <form id="profile-form" onSubmit={saveVendorProfile} className="profileForm">
        <div className="sectionHead">
          <p className="eyebrow">Business Identity</p>
          <h2>Tell organizers and vendors who you are.</h2>
          <p>
            A strong profile helps organizers understand your products, event
            fit, location, and brand quality.
          </p>
        </div>

        <label>
          Business Name *
          <input
            required
            placeholder="Example: JH Mushroom Coffee"
            value={profile.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
          />
        </label>

        <label>
          Profile URL Slug
          <input
            placeholder="Example: jh-mushroom-coffee"
            value={profile.slug}
            onChange={(e) => updateField("slug", e.target.value)}
          />
        </label>

        <div className="twoCol">
          <label>
            Category *
            <select
              required
              value={profile.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Years in Business
            <input
              placeholder="Example: 2 years"
              value={profile.years_in_business}
              onChange={(e) => updateField("years_in_business", e.target.value)}
            />
          </label>
        </div>

        <div className="twoCol">
          <label>
            City
            <input
              placeholder="Example: Morris"
              value={profile.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </label>

          <label>
            State
            <input
              placeholder="Example: CT"
              value={profile.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </label>
        </div>

        <label>
          Short Description *
          <input
            required
            placeholder="Example: Premium mushroom coffee and wellness products."
            value={profile.short_description}
            onChange={(e) => updateField("short_description", e.target.value)}
          />
        </label>

        <label>
          Full Business Story
          <textarea
            placeholder="Tell your story, what you sell, your best events, your products, and why organizers should choose you."
            value={profile.full_description}
            onChange={(e) => updateField("full_description", e.target.value)}
          />
        </label>

        <div className="sectionDivider">
          <p className="eyebrow">Premium Media</p>
          <h3>Upload your logo and banner.</h3>
        </div>

        <div className="twoCol">
          <label>
            Business Logo — recommended 800 x 800 px
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </label>

          <label>
            Business Banner — recommended 1600 x 600 px
            <input type="file" accept="image/*" onChange={handleBannerUpload} />
          </label>
        </div>

        <div className="mediaPreviewGrid">
          <div>
            <strong>Logo Preview</strong>
            <img
              src={
                logoPreview ||
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop"
              }
              alt="Logo preview"
            />
          </div>

          <div>
            <strong>Banner Preview</strong>
            <img
              src={
                bannerPreview ||
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
              }
              alt="Banner preview"
            />
          </div>
        </div>

        <div className="sectionDivider">
          <p className="eyebrow">Contact & Social Links</p>
          <h3>Help organizers learn more about your business.</h3>
        </div>

        <div className="twoCol">
          <label>
            Website
            <input
              placeholder="https://yourwebsite.com"
              value={profile.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              placeholder="Business phone"
              value={profile.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </label>
        </div>

        <div className="twoCol">
          <label>
            Instagram
            <input
              placeholder="@yourbusiness"
              value={profile.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
            />
          </label>

          <label>
            TikTok
            <input
              placeholder="@yourbusiness"
              value={profile.tiktok}
              onChange={(e) => updateField("tiktok", e.target.value)}
            />
          </label>
        </div>

        <label>
          Facebook
          <input
            placeholder="Facebook page URL"
            value={profile.facebook}
            onChange={(e) => updateField("facebook", e.target.value)}
          />
        </label>

        <div className="infoGrid">
          <div>
            <strong>Profile Strength</strong>
            <p>
              Add a logo, banner, description, category, and website/social
              links to improve trust.
            </p>
          </div>

          <div>
            <strong>Public Profile</strong>
            <p>
              Your profile can help organizers discover your business and
              understand if you are a strong fit for their event.
            </p>
          </div>
        </div>

        <button type="submit" className="submitBtn" disabled={loading}>
          {loading ? "Saving Profile..." : "Save Premium Vendor Profile"}
        </button>
      </form>

      <style jsx>{`
        .profilePage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        section,
        .profileForm {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .hero {
          min-height: 82vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
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
          font-size: clamp(36px, 5vw, 66px);
          line-height: 0.94;
          letter-spacing: -0.065em;
          margin: 0;
        }

        h3 {
          font-size: 25px;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .heroText,
        .heroPanel p,
        .sectionHead p,
        .previewBody p,
        .profileForm p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 760px;
          margin-top: 24px;
        }

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
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

        button.secondary {
          background: rgba(255, 255, 255, 0.55);
          color: #10291f;
          border: 1px solid #cdbf9f;
        }

        .trustRow,
        .pillGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }

        .trustRow span,
        .pillGrid span {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 850;
        }

        .heroPanel,
        .profilePreview,
        .profileForm {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
          text-align: center;
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

        .scoreCircle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f7f1e6;
          border: 12px solid #b88a2e;
          font-size: 48px;
          font-weight: 1000;
          margin: 28px auto;
        }

        .sectionHead {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .profilePreview {
          overflow: hidden;
        }

        .banner {
          min-height: 260px;
          background-size: cover;
          background-position: center;
        }

        .previewBody {
          padding: 34px;
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 22px;
          align-items: center;
        }

        .logo {
          width: 110px;
          height: 110px;
          border-radius: 28px;
          object-fit: cover;
          border: 4px solid #f7f1e6;
          box-shadow: 0 16px 34px rgba(16, 41, 31, 0.16);
        }

        .profileForm {
          padding: 48px;
          margin-bottom: 76px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #d8ccb5;
          border-radius: 18px;
          padding: 14px 16px;
          font: inherit;
          background: white;
          color: #10291f;
        }

        textarea {
          min-height: 160px;
          resize: vertical;
        }

        .twoCol,
        .mediaPreviewGrid,
        .infoGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .sectionDivider {
          margin: 34px 0 18px;
        }

        .mediaPreviewGrid {
          margin: 18px 0 26px;
        }

        .mediaPreviewGrid div,
        .infoGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 22px;
        }

        .mediaPreviewGrid strong,
        .infoGrid strong {
          display: block;
          margin-bottom: 12px;
        }

        .mediaPreviewGrid img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 20px;
        }

        .infoGrid {
          margin: 22px 0;
        }

        .submitBtn {
          width: 100%;
          margin-top: 10px;
        }

        @media (max-width: 950px) {
          .hero,
          .previewBody,
          .twoCol,
          .mediaPreviewGrid,
          .infoGrid {
            grid-template-columns: 1fr;
          }

          section,
          .profileForm {
            padding: 54px 16px;
          }

          .hero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 54px;
          }

          .profileForm {
            padding: 30px 18px;
          }
        }
      `}</style>
    </main>
  );
}