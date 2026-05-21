"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OrganizerSetupPage() {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [profile, setProfile] = useState({
    organizer_name: "",
    slug: "",
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
  });

  useEffect(() => {
    async function loadExistingProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("organizer_profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          organizer_name: data.organizer_name || "",
          slug: data.slug || "",
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
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
        if (data.banner_url) setBannerPreview(data.banner_url);
      }
    }

    loadExistingProfile();
  }, []);

  const profileScore = useMemo(() => {
    let score = 15;

    if (profile.organizer_name) score += 20;
    if (profile.short_description) score += 15;
    if (profile.full_description) score += 15;
    if (profile.logo_url) score += 15;
    if (profile.banner_url) score += 10;
    if (profile.website) score += 10;
    if (
      profile.instagram ||
      profile.facebook ||
      profile.tiktok
    )
      score += 10;

    return Math.min(score, 100);
  }, [profile]);

  function updateField(field: string, value: string) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function uploadImage(
    file: File,
    bucket: string
  ) {
    const fileExt = file.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } =
      await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } =
      supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(
      file,
      "organizer-logos"
    );

    if (url) {
      updateField("logo_url", url);
      setLogoPreview(url);
    }
  }

  async function handleBannerUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(
      file,
      "organizer-banners"
    );

    if (url) {
      updateField("banner_url", url);
      setBannerPreview(url);
    }
  }

  async function saveOrganizerProfile(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { data: userData } =
      await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    const cleanSlug =
      profile.slug ||
      profile.organizer_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { error } = await supabase
      .from("organizer_profiles")
      .upsert(
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

    alert("Organizer profile saved!");

    window.location.href =
      `/organizers/${cleanSlug}`;
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">
            Organizer Profile Setup
          </p>

          <h1>
            Build trust before vendors
            even apply.
          </h1>

          <p className="heroText">
            Add your social media,
            organizer story, logo,
            event brand, and public
            organizer profile.
          </p>

          <div className="trustRow">
            <span>Vendor Trust</span>
            <span>Better Applications</span>
            <span>Professional Presence</span>
          </div>

          <div className="heroActions" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="secondary"
              onClick={() =>
                (window.location.href = "/dashboard/organizer")
              }
            >
              Back To Dashboard
            </button>
          </div>
        </div>

        <div className="heroPanel">
          <p className="eyebrow">
            Organizer Strength
          </p>

          <div className="scoreCircle">
            {profileScore}
          </div>

          <h3>
            {profileScore >= 80
              ? "Strong profile"
              : "Needs improvement"}
          </h3>

          <p>
            Vendors trust organizers
            with complete profiles.
          </p>
        </div>
      </section>

      <form
        onSubmit={saveOrganizerProfile}
        className="form"
      >
        <div className="sectionHead">
          <p className="eyebrow">
            Organizer Details
          </p>

          <h2>
            Tell vendors who you are.
          </h2>
        </div>

        <label>
          Organizer Name *
          <input
            required
            placeholder="Example: Litchfield County Events"
            value={profile.organizer_name}
            onChange={(e) =>
              updateField(
                "organizer_name",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Organizer URL Slug
          <input
            placeholder="litchfield-county-events"
            value={profile.slug}
            onChange={(e) =>
              updateField(
                "slug",
                e.target.value
              )
            }
          />
        </label>

        <div className="twoCol">
          <label>
            City
            <input
              placeholder="Litchfield"
              value={profile.city}
              onChange={(e) =>
                updateField(
                  "city",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            State
            <input
              placeholder="CT"
              value={profile.state}
              onChange={(e) =>
                updateField(
                  "state",
                  e.target.value
                )
              }
            />
          </label>
        </div>

        <label>
          Short Description *
          <input
            required
            placeholder="Short organizer description"
            value={
              profile.short_description
            }
            onChange={(e) =>
              updateField(
                "short_description",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Full Organizer Story
          <textarea
            placeholder="Tell vendors about your event history, audience, traffic, marketing, and why vendors should trust your events."
            value={
              profile.full_description
            }
            onChange={(e) =>
              updateField(
                "full_description",
                e.target.value
              )
            }
          />
        </label>

        <div className="sectionDivider">
          <p className="eyebrow">
            Branding
          </p>
          <h3>
            Upload logo and banner
          </h3>
        </div>

        <div className="twoCol">
          <label>
            Organizer Logo
            <input
              type="file"
              accept="image/*"
              onChange={
                handleLogoUpload
              }
            />
          </label>

          <label>
            Organizer Banner
            <input
              type="file"
              accept="image/*"
              onChange={
                handleBannerUpload
              }
            />
          </label>
        </div>

        <div className="sectionDivider">
          <p className="eyebrow">
            Social Media
          </p>

          <h3>
            Vendors want to see your
            audience and marketing.
          </h3>
        </div>

        <label>
          Website
          <input
            placeholder="https://yourwebsite.com"
            value={profile.website}
            onChange={(e) =>
              updateField(
                "website",
                e.target.value
              )
            }
          />
        </label>

        <div className="twoCol">
          <label>
            Instagram
            <input
              placeholder="@yourpage"
              value={
                profile.instagram
              }
              onChange={(e) =>
                updateField(
                  "instagram",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            TikTok
            <input
              placeholder="@yourpage"
              value={profile.tiktok}
              onChange={(e) =>
                updateField(
                  "tiktok",
                  e.target.value
                )
              }
            />
          </label>
        </div>

        <label>
          Facebook
          <input
            placeholder="Facebook page"
            value={profile.facebook}
            onChange={(e) =>
              updateField(
                "facebook",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Phone
          <input
            placeholder="Business phone"
            value={profile.phone}
            onChange={(e) =>
              updateField(
                "phone",
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
            ? "Saving..."
            : "Save Organizer Profile"}
        </button>
      </form>

      <style jsx>{`
        .page {
          background: #f7f1e6;
          min-height: 100vh;
          color: #10291f;
        }

        section,
        .form {
          max-width: 1180px;
          margin: 0 auto;
          padding: 70px 18px;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 30px;
          align-items: center;
          min-height: 70vh;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        h1 {
          font-size: clamp(50px, 8vw, 92px);
          line-height: .9;
        }

        h2 {
          font-size: 46px;
        }

        .heroText {
          color: #5f6b66;
          line-height: 1.8;
          max-width: 700px;
        }

        .heroPanel,
        .form {
          background: white;
          border-radius: 36px;
          border: 1px solid #eadfc9;
          padding: 34px;
          box-shadow: 0 30px 90px rgba(20,88,63,.12);
        }

        .scoreCircle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f7f1e6;
          border: 12px solid #b88a2e;
          font-size: 44px;
          font-weight: 1000;
          margin: 20px auto;
        }

        .trustRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .trustRow span {
          background: white;
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          font-weight: 800;
        }

        label {
          display: grid;
          gap: 8px;
          margin-bottom: 18px;
          font-weight: 800;
        }

        input,
        textarea {
          border: 1px solid #ddd;
          border-radius: 18px;
          padding: 14px 16px;
          width: 100%;
        }

        textarea {
          min-height: 160px;
        }

        .twoCol {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 16px;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          padding: 16px 24px;
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
        }

        .submitBtn {
          width: 100%;
          margin-top: 10px;
        }

        @media(max-width:950px){
          .hero,
          .twoCol {
            grid-template-columns:1fr;
          }

          h1 {
            font-size:54px;
          }
        }
      `}</style>
    </main>
  );
}