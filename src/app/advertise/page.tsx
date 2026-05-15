"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdvertisePage() {
  const [loading, setLoading] = useState(false);
  const [adPreview, setAdPreview] = useState("");

  const [ad, setAd] = useState({
    business_name: "",
    title: "",
    description: "",
    link_url: "",
    placement: "homepage",
    image_url: "",
  });

  function updateField(field: string, value: string) {
    setAd({ ...ad, [field]: value });
  }

  async function uploadAdImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("ads")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage.from("ads").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleAdImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadAdImage(file);

    if (url) {
      updateField("image_url", url);
      setAdPreview(url);
    }
  }

  async function submitAd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("sponsored_ads").insert({
      ...ad,
      created_by: userData.user.id,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Ad request submitted successfully!");
    window.location.href = "/";
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Premium Advertising</p>
          <h1>Advertise on VendorEventsHub</h1>
          <p className="muted">
            Promote your festival, vendor brand, service, food truck, or
            business to vendors and event organizers.
          </p>
        </div>
      </section>

      <form onSubmit={submitAd} className="eventCreateCard">
        <div className="formSectionTitle">
          <p className="goldEyebrow">Sponsored Placement</p>
          <h2>Create a premium ad request.</h2>
        </div>

        <label>
          Business Name
          <input
            required
            placeholder="Example: JH Mushroom Coffee"
            value={ad.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
          />
        </label>

        <label>
          Ad Headline
          <input
            required
            placeholder="Example: Premium Mushroom Coffee for Event Vendors"
            value={ad.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <label>
          Ad Description
          <textarea
            required
            placeholder="Describe what you want to promote."
            value={ad.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <div className="twoColumnForm">
          <label>
            Placement
            <select
              value={ad.placement}
              onChange={(e) => updateField("placement", e.target.value)}
            >
              <option value="homepage">Homepage Banner</option>
              <option value="events">Events Page</option>
              <option value="vendor_directory">Vendor Directory</option>
              <option value="event_detail">Event Detail Page</option>
            </select>
          </label>

          <label>
            Link URL
            <input
              placeholder="https://yourwebsite.com"
              value={ad.link_url}
              onChange={(e) => updateField("link_url", e.target.value)}
            />
          </label>
        </div>

        <label>
          Upload Ad Image — recommended 1600 x 500 px for banner or 1200 x 900 px for card
          <input type="file" accept="image/*" onChange={handleAdImageUpload} />
        </label>

        {adPreview && (
          <img
            src={adPreview}
            alt="Ad preview"
            style={{
              width: "100%",
              height: "260px",
              objectFit: "cover",
              borderRadius: "28px",
            }}
          />
        )}

        <div className="eventInfoGrid">
          <div>
            <strong>Recommended Banner Size</strong>
            <p>Homepage banner: 1600 x 500 px. Card ad: 1200 x 900 px.</p>
          </div>

          <div>
            <strong>Premium Visibility</strong>
            <p>
              Later we can add Stripe payment, approval status, and automatic ad
              scheduling.
            </p>
          </div>
        </div>

        <button className="goldBtn createEventBtn" type="submit">
          {loading ? "Submitting Ad..." : "Submit Ad Request"}
        </button>
      </form>
    </main>
  );
}