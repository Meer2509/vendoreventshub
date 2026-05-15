"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

  function updateField(field: string, value: string) {
    setProfile({ ...profile, [field]: value });
  }

  async function uploadImage(file: File, bucket: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

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

    const { error } = await supabase.from("vendor_profiles").upsert({
      user_id: userData.user.id,
      ...profile,
      slug: cleanSlug,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Vendor profile saved successfully!");
    window.location.href = `/vendors/${cleanSlug}`;
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Vendor Profile Setup</p>
          <h1>Build your premium vendor page.</h1>
          <p className="muted">
            Create a luxury business profile with your logo, banner, story,
            links, and vendor identity.
          </p>
        </div>
      </section>

      <form onSubmit={saveVendorProfile} className="eventCreateCard">
        <div className="formSectionTitle">
          <p className="goldEyebrow">Business Identity</p>
          <h2>Tell organizers and vendors who you are.</h2>
        </div>

        <label>
          Business Name
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

        <div className="twoColumnForm">
          <label>
            Category
            <select
              required
              value={profile.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Choose category</option>
              <option>Food & Beverage</option>
              <option>Handmade Goods</option>
              <option>Health & Wellness</option>
              <option>Beauty & Skincare</option>
              <option>Home Decor</option>
              <option>Artisan Products</option>
              <option>Clothing & Apparel</option>
              <option>Jewelry</option>
              <option>Food Truck</option>
              <option>Service Business</option>
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

        <div className="twoColumnForm">
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
          Short Description
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
            placeholder="Tell your story, what you sell, and what kind of events you attend."
            value={profile.full_description}
            onChange={(e) => updateField("full_description", e.target.value)}
          />
        </label>

        <div className="formSectionTitle">
          <p className="goldEyebrow">Premium Media</p>
          <h2>Upload your logo and banner.</h2>
        </div>

        <label>
          Business Logo — recommended 800 x 800 px
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
        </label>

        {logoPreview && (
          <img
            src={logoPreview}
            alt="Logo preview"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "24px",
            }}
          />
        )}

        <label>
          Business Banner — recommended 1600 x 600 px
          <input type="file" accept="image/*" onChange={handleBannerUpload} />
        </label>

        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Banner preview"
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              borderRadius: "28px",
            }}
          />
        )}

        <div className="twoColumnForm">
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

        <div className="twoColumnForm">
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

        <button type="submit" className="goldBtn createEventBtn">
          {loading ? "Saving Profile..." : "Save Vendor Profile"}
        </button>
      </form>
    </main>
  );
}