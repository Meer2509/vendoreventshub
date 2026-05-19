"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const placements = [
  {
    name: "Homepage Banner",
    price: "$249/mo",
    value: "homepage",
    description:
      "Premium visibility on the homepage for brands that want maximum awareness.",
    bestFor: "National brands, vendor tools, premium local businesses",
  },
  {
    name: "Events Page Sponsored Card",
    price: "$99/mo",
    value: "events",
    description:
      "Appear where vendors are actively searching for events to attend.",
    bestFor: "Event organizers, services, food trucks, vendor suppliers",
  },
  {
    name: "Event Detail Sidebar",
    price: "$79/mo",
    value: "event_detail",
    description:
      "Show your ad when vendors are researching a specific event opportunity.",
    bestFor: "Insurance, tents, POS, packaging, booth supplies",
  },
  {
    name: "Dashboard Growth Card",
    price: "$149/mo",
    value: "dashboard",
    description:
      "Reach logged-in vendors while they manage saved events and applications.",
    bestFor: "High-intent vendor business services",
  },
  {
    name: "Vendor Directory Feature",
    price: "$49/mo",
    value: "vendor_directory",
    description:
      "Feature your vendor brand or service inside the vendor discovery area.",
    bestFor: "Vendors, caterers, food trucks, artists, local services",
  },
  {
    name: "Category Sponsor",
    price: "$299/mo",
    value: "category_sponsor",
    description:
      "Sponsor a category like food festivals, craft fairs, farmers markets, or wellness events.",
    bestFor: "Regional sponsors and category leaders",
  },
];

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
    budget: "$249/mo",
  });

  function updateField(field: string, value: string) {
    setAd({ ...ad, [field]: value });
  }

  function selectPlacement(value: string, price: string) {
    setAd({ ...ad, placement: value, budget: price });
  }

  async function uploadAdImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage.from("ads").upload(fileName, file);

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

    try {
      const response = await fetch("/api/create-ad-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...ad,
          created_by: userData.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }

      if (!data.url) {
        alert("Stripe checkout URL was not returned.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      alert("Something went wrong while starting checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Premium Advertising</p>
          <h1>Reach vendors before they choose their next event.</h1>
          <p className="muted">
            Promote your festival, vendor brand, food truck, business service,
            booth equipment, insurance, packaging, POS system, or local business
            to high-intent vendors and organizers.
          </p>
        </div>

        <button
          className="goldBtn"
          onClick={() =>
            document
              .getElementById("ad-request-form")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Start Secure Checkout
        </button>
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Media Kit</p>
            <h2>Choose where your brand appears.</h2>
          </div>
        </div>

        <div className="featureGrid">
          {placements.map((placement) => (
            <div
              className="featureBox"
              key={placement.value}
              style={{
                border:
                  ad.placement === placement.value
                    ? "2px solid #0f3d2e"
                    : "1px solid rgba(15,61,46,0.08)",
                boxShadow:
                  ad.placement === placement.value
                    ? "0 24px 70px rgba(15,61,46,0.16)"
                    : undefined,
              }}
            >
              <span className="stepNumber">{placement.price}</span>
              <h3>{placement.name}</h3>
              <p>{placement.description}</p>
              <p className="muted">
                <strong>Best for:</strong> {placement.bestFor}
              </p>

              <button
                type="button"
                className={
                  ad.placement === placement.value ? "goldBtn" : "outlineBtn"
                }
                onClick={() => selectPlacement(placement.value, placement.price)}
              >
                {ad.placement === placement.value
                  ? "Selected"
                  : "Select Placement"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Where Ads Appear</p>
            <h2>Designed for real buyer intent.</h2>
          </div>
        </div>

        <div className="eventInfoGrid">
          <div>
            <strong>Homepage</strong>
            <p>
              Best for broad visibility. Your brand appears near the highest-traffic
              entry point of the platform.
            </p>
          </div>

          <div>
            <strong>Events Marketplace</strong>
            <p>
              Best for reaching vendors actively searching for festivals, fairs,
              farmers markets, expos, and vendor events.
            </p>
          </div>

          <div>
            <strong>Event Details</strong>
            <p>
              Best for highly targeted ads shown when vendors are evaluating a
              specific event and thinking about booth costs.
            </p>
          </div>

          <div>
            <strong>Dashboard</strong>
            <p>
              Best for vendors already logged in, saving events, applying, and
              making business decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboardSavedSection">
        <div className="sectionHeader">
          <div>
            <p className="goldEyebrow">Live Preview</p>
            <h2>Your ad will look premium, clean, and trusted.</h2>
          </div>
        </div>

        <div className="liveAdsGrid">
          <article className="liveAdCard">
            <div
              className="liveAdImage"
              style={{
                backgroundImage: `url(${
                  adPreview ||
                  "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
                })`,
              }}
            >
              <span>Sponsored</span>
            </div>

            <div className="liveAdBody">
              <p className="goldEyebrow">
                {ad.business_name || "Your Business Name"}
              </p>
              <h3>{ad.title || "Your Premium Ad Headline"}</h3>
              <p className="muted">
                {ad.description ||
                  "Your ad description will appear here with a clean premium layout designed for vendor attention."}
              </p>
              <button type="button" className="goldBtn fullWidth">
                Visit Website
              </button>
            </div>
          </article>

          <article className="liveAdCard">
            <div
              className="liveAdImage"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1400&auto=format&fit=crop)",
              }}
            >
              <span>Demo Placement</span>
            </div>

            <div className="liveAdBody">
              <p className="goldEyebrow">Example</p>
              <h3>Vendor tent, POS, insurance, or supply brand</h3>
              <p className="muted">
                Perfect for companies that serve vendors before, during, or after
                event day.
              </p>
              <button type="button" className="outlineBtn fullWidth">
                Example Ad
              </button>
            </div>
          </article>

          <article className="liveAdCard">
            <div
              className="liveAdImage"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1400&auto=format&fit=crop)",
              }}
            >
              <span>Sponsored Event</span>
            </div>

            <div className="liveAdBody">
              <p className="goldEyebrow">Organizer Boost</p>
              <h3>Put your event in front of serious vendors</h3>
              <p className="muted">
                Sponsored events can appear higher in discovery and attract more
                qualified vendor applicants.
              </p>
              <button type="button" className="outlineBtn fullWidth">
                Boost Event
              </button>
            </div>
          </article>
        </div>
      </section>

      <form id="ad-request-form" onSubmit={submitAd} className="eventCreateCard">
        <div className="formSectionTitle">
          <p className="goldEyebrow">Sponsored Placement Request</p>
          <h2>Create your premium ad request.</h2>
          <p className="muted">
            Your payment is securely processed through Stripe. After payment, your
            ad enters review before approval.
          </p>
        </div>

        <label>
          Business Name <span style={{ color: "#c1121f" }}>*</span>
          <input
            required
            placeholder="Example: JH Mushroom Coffee"
            value={ad.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
          />
        </label>

        <label>
          Ad Headline <span style={{ color: "#c1121f" }}>*</span>
          <input
            required
            placeholder="Example: Premium Supplies for Event Vendors"
            value={ad.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <label>
          Ad Description <span style={{ color: "#c1121f" }}>*</span>
          <textarea
            required
            placeholder="Describe what you want to promote."
            value={ad.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <div className="twoColumnForm">
          <label>
            Placement <span style={{ color: "#c1121f" }}>*</span>
            <select
              value={ad.placement}
              onChange={(e) => {
                const selected = placements.find(
                  (item) => item.value === e.target.value
                );
                updateField("placement", e.target.value);
                if (selected) updateField("budget", selected.price);
              }}
            >
              {placements.map((placement) => (
                <option key={placement.value} value={placement.value}>
                  {placement.name} — {placement.price}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monthly Budget
            <input value={ad.budget} readOnly />
          </label>
        </div>

        <div className="twoColumnForm">
          <label>
            Link URL
            <input
              placeholder="https://yourwebsite.com"
              value={ad.link_url}
              onChange={(e) => updateField("link_url", e.target.value)}
            />
          </label>

          <label>
            Upload Ad Image
            <input type="file" accept="image/*" onChange={handleAdImageUpload} />
          </label>
        </div>

        {adPreview && (
          <img
            src={adPreview}
            alt="Ad preview"
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "28px",
            }}
          />
        )}

        <div className="eventInfoGrid">
          <div>
            <strong>Recommended Image Sizes</strong>
            <p>
              Homepage banner: 1600 x 500 px. Card ad: 1200 x 900 px. Event
              sidebar: 900 x 900 px.
            </p>
          </div>

          <div>
            <strong>Approval Workflow</strong>
            <p>
              Your payment is securely processed through Stripe. After payment,
              your ad enters review before approval.
            </p>
          </div>
        </div>

        <button className="goldBtn createEventBtn" type="submit" disabled={loading}>
          {loading
            ? "Redirecting To Secure Checkout..."
            : "Continue To Secure Checkout"}
        </button>
      </form>
    </main>
  );
}