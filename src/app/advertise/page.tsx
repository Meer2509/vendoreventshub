\"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const placements = [
  {
    name: "Vendor Directory Feature",
    price: "$49",
    duration: "30 Days",
    value: "vendor_directory",
    checkoutPlan: "vendor",
    priceId: "price_1TYtAoCd2ATbUlJglTQSZSl9",
    badge: "Directory",
    description:
      "Feature your vendor business inside the vendor directory for stronger discovery.",
    bestFor: "Vendors, caterers, food trucks, artists, local services",
  },
  {
    name: "Event Detail Sidebar Ad",
    price: "$79",
    duration: "30 Days",
    value: "event_detail",
    checkoutPlan: "organizer",
    priceId: "price_1TYt7FCd2ATbUlJgIAJsPSgu",
    badge: "Sidebar",
    description:
      "Show your ad when vendors are researching a specific event opportunity.",
    bestFor: "Insurance, tents, POS, packaging, booth supplies",
  },
  {
    name: "Events Page Sponsored Card",
    price: "$99",
    duration: "30 Days",
    value: "events",
    checkoutPlan: "organizer",
    priceId: "price_1TYt6lCd2ATbUlJgNx9R2TS4",
    badge: "High Intent",
    description:
      "Appear where vendors are actively searching for events to attend.",
    bestFor: "Event organizers, vendor services, food trucks, suppliers",
    featured: true,
  },
  {
    name: "Dashboard Premium Ad",
    price: "$149",
    duration: "30 Days",
    value: "dashboard",
    checkoutPlan: "homepage",
    priceId: "price_1TYt7pCd2ATbUlJgSjcwbtSx",
    badge: "Dashboard",
    description:
      "Reach logged-in vendors while they manage saved events and opportunities.",
    bestFor: "High-intent vendor business services",
  },
  {
    name: "Homepage Premium Ad",
    price: "$249",
    duration: "30 Days",
    value: "homepage",
    checkoutPlan: "homepage",
    priceId: "price_1TYt3yCd2ATbUlJgUDIbjMXm",
    badge: "Most Popular",
    description:
      "Premium homepage visibility below the hero section for maximum awareness.",
    bestFor: "Major events, national brands, premium local businesses",
    featured: true,
  },
  {
    name: "Category Sponsor Premium",
    price: "$299",
    duration: "30 Days",
    value: "category_sponsor",
    checkoutPlan: "homepage",
    priceId: "price_1TYtBPCd2ATbUlJgL2DsS3D7",
    badge: "Premium Sponsor",
    description:
      "Sponsor a category like food festivals, craft fairs, farmers markets, or wellness events.",
    bestFor: "Regional sponsors and category leaders",
    premium: true,
  },
];

export default function AdvertisePage() {
  const [loading, setLoading] = useState(false);
  const [adPreview, setAdPreview] = useState("");

  const [ad, setAd] = useState({
    business_name: "",
    title: "",
    description: "",
    special_note: "",
    link_url: "",
    placement: "homepage",
    image_url: "",
    budget: "$249 / 30 Days",
    price_id: "price_1TYt3yCd2ATbUlJgUDIbjMXm",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const priceId = params.get("price");

    if (!priceId) return;

    const selected = placements.find((item) => item.priceId === priceId);

    if (selected) {
      setAd((prev) => ({
        ...prev,
        placement: selected.value,
        budget: `${selected.price} / ${selected.duration}`,
        price_id: selected.priceId,
      }));
    }
  }, []);

  const selectedPlacement = useMemo(() => {
    return placements.find((item) => item.value === ad.placement) || placements[4];
  }, [ad.placement]);

  function updateField(field: string, value: string) {
    setAd((prev) => ({ ...prev, [field]: value }));
  }

  function selectPlacement(placement: any) {
    setAd((prev) => ({
      ...prev,
      placement: placement.value,
      budget: `${placement.price} / ${placement.duration}`,
      price_id: placement.priceId,
    }));
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
      const params = new URLSearchParams({
        plan: selectedPlacement.checkoutPlan,
        price_id: selectedPlacement.priceId,
        business_name: ad.business_name,
        title: ad.title,
        description: ad.description,
        special_note: ad.special_note || "",
        link_url: ad.link_url,
        placement: ad.placement,
        image_url: ad.image_url || "",
        budget: ad.budget,
      });

      window.location.href = `/checkout?${params.toString()}`;
    } catch {
      alert("Something went wrong while starting checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="advertisePage">
      <section className="adHero">
        <div>
          <p className="eyebrow">Premium Advertising</p>
          <h1>Put your brand in front of vendors.</h1>
          <p className="heroText">
            Promote your event, business, service, food truck, booth equipment,
            insurance, POS system, packaging, or local brand to vendors actively
            searching for opportunities.
          </p>

          <div className="heroActions">
            <button
              onClick={() =>
                document
                  .getElementById("ad-request-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start Premium Checkout
            </button>
            <button
              className="secondary"
              onClick={() => (window.location.href = "/pricing")}
            >
              View Pricing
            </button>
          </div>
        </div>

        <div className="heroPanel">
          <p className="eyebrow">Selected Placement</p>
          <h3>{selectedPlacement.name}</h3>
          <div className="heroPrice">
            <strong>{selectedPlacement.price}</strong>
            <span>/ {selectedPlacement.duration}</span>
          </div>
          <p>{selectedPlacement.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <p className="eyebrow">Choose Placement</p>
          <h2>Premium visibility designed for vendor intent.</h2>
        </div>

        <div className="placementGrid">
          {placements.map((placement) => (
            <article
              key={placement.value}
              className={[
                "placementCard",
                ad.placement === placement.value ? "selected" : "",
                placement.premium ? "premium" : "",
              ].join(" ")}
            >
              <div className="badgeRow">
                <span>{placement.badge}</span>
                {placement.featured && <strong>Recommended</strong>}
              </div>

              <h3>{placement.name}</h3>

              <div className="priceLine">
                <strong>{placement.price}</strong>
                <span>/ {placement.duration}</span>
              </div>

              <p>{placement.description}</p>

              <small>
                <b>Best for:</b> {placement.bestFor}
              </small>

              <button type="button" onClick={() => selectPlacement(placement)}>
                {ad.placement === placement.value ? "Selected" : "Select Placement"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section previewSection">
        <div className="sectionHead">
          <p className="eyebrow">Live Preview</p>
          <h2>Your ad will look clean, premium, and trusted.</h2>
        </div>

        <article className="previewCard">
          <div
            className="previewImage"
            style={{
              backgroundImage: `url(${
                adPreview ||
                "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
              })`,
            }}
          >
            <span>Sponsored</span>
          </div>

          <div className="previewBody">
            <p className="eyebrow">{ad.business_name || "Your Business Name"}</p>
            <h3>{ad.title || "Your Premium Ad Title"}</h3>
            <p>
              {ad.description ||
                "Your ad description will appear here with a clean premium layout designed for vendor attention."}
            </p>

            {ad.special_note && (
              <div className="specialNote">
                <strong>Special Note</strong>
                <p>{ad.special_note}</p>
              </div>
            )}

            <button type="button">Visit Website</button>
          </div>
        </article>
      </section>

      <form id="ad-request-form" onSubmit={submitAd} className="adForm">
        <div className="sectionHead">
          <p className="eyebrow">Sponsored Placement Request</p>
          <h2>Create your premium ad.</h2>
          <p>
            Your payment is securely processed through Stripe. After payment,
            your ad enters review before approval.
          </p>
        </div>

        <label>
          Business Name *
          <input
            required
            placeholder="Example: JH Mushroom Coffee"
            value={ad.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
          />
        </label>

        <label>
          Ad Title *
          <input
            required
            placeholder="Example: Premium Supplies for Event Vendors"
            value={ad.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <label>
          Ad Description *
          <textarea
            required
            placeholder="Describe your business, event, service, promotion, or offer. This is what vendors will read."
            value={ad.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <label>
          Special Notes / Instructions
          <textarea
            placeholder="Example: Mention our grand opening, promote our discount code, emphasize local business, include specific wording, or important details for approval."
            value={ad.special_note}
            onChange={(e) => updateField("special_note", e.target.value)}
          />
        </label>

        <div className="twoCol">
          <label>
            Placement *
            <select
              value={ad.placement}
              onChange={(e) => {
                const selected = placements.find(
                  (item) => item.value === e.target.value
                );
                if (selected) selectPlacement(selected);
              }}
            >
              {placements.map((placement) => (
                <option key={placement.value} value={placement.value}>
                  {placement.name} — {placement.price} / {placement.duration}
                </option>
              ))}
            </select>
          </label>

          <label>
            Selected Price
            <input value={ad.budget} readOnly />
          </label>
        </div>

        <div className="twoCol">
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

        <div className="infoGrid">
          <div>
            <strong>Recommended Image Sizes</strong>
            <p>
              Homepage: 1600 x 500 px. Card ads: 1200 x 900 px. Sidebar:
              900 x 900 px.
            </p>
          </div>

          <div>
            <strong>Approval Workflow</strong>
            <p>
              After payment, your ad enters review before it appears on the
              platform.
            </p>
          </div>
        </div>

        <button className="submitBtn" type="submit" disabled={loading}>
          {loading ? "Opening Premium Checkout..." : "Continue To Premium Checkout"}
        </button>
      </form>

      <style jsx>{`
        .advertisePage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        section,
        .adForm {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .adHero {
          min-height: 82vh;
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
        .sectionHead p,
        .heroPanel p,
        .placementCard p,
        .previewBody p,
        .adForm p {
          color: #5f6b66;
          line-height: 1.7;
        }

        .heroText {
          font-size: 18px;
          max-width: 740px;
          margin-top: 24px;
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

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        .heroPanel,
        .placementCard,
        .previewCard,
        .adForm {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
          backdrop-filter: blur(12px);
        }

        .heroPanel {
          padding: 36px;
        }

        .heroPrice {
          background: #10291f;
          color: white;
          border-radius: 30px;
          padding: 28px;
          margin: 26px 0;
        }

        .heroPrice strong {
          font-size: 78px;
          letter-spacing: -0.08em;
          line-height: 0.95;
        }

        .heroPrice span {
          color: rgba(255, 255, 255, 0.72);
          font-weight: 850;
        }

        .sectionHead {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .placementGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .placementCard {
          padding: 28px;
        }

        .placementCard.selected {
          border: 2px solid #10291f;
          box-shadow: 0 34px 95px rgba(16, 41, 31, 0.18);
        }

        .placementCard.premium {
          background: linear-gradient(145deg, #10291f, #1f4f3c);
          color: white;
        }

        .placementCard.premium p,
        .placementCard.premium small,
        .placementCard.premium .priceLine span {
          color: rgba(255, 255, 255, 0.76);
        }

        .badgeRow {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .badgeRow span,
        .badgeRow strong {
          background: #f7f1e6;
          color: #10291f;
          border-radius: 999px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .badgeRow strong {
          background: #b88a2e;
          color: white;
        }

        .priceLine {
          display: flex;
          align-items: end;
          gap: 8px;
          margin: 18px 0;
        }

        .priceLine strong {
          font-size: 58px;
          letter-spacing: -0.08em;
          line-height: 1;
        }

        .priceLine span {
          color: #5f6b66;
          font-weight: 850;
          margin-bottom: 8px;
        }

        .placementCard small {
          display: block;
          color: #5f6b66;
          line-height: 1.6;
          margin: 18px 0;
        }

        .placementCard button,
        .submitBtn {
          width: 100%;
          margin-top: 8px;
        }

        .previewCard {
          display: grid;
          grid-template-columns: minmax(280px, 42%) 1fr;
          overflow: hidden;
        }

        .previewImage {
          min-height: 360px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .previewImage span {
          position: absolute;
          top: 18px;
          left: 18px;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 950;
        }

        .previewBody {
          padding: 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .specialNote {
          margin-top: 18px;
          background: #f7f1e6;
          border: 1px solid #eadfc9;
          border-radius: 18px;
          padding: 16px;
        }

        .specialNote strong {
          display: block;
          color: #10291f;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .specialNote p {
          margin: 0;
          color: #5f6b66;
          line-height: 1.6;
        }

        .adForm {
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
          min-height: 130px;
          resize: vertical;
        }

        .twoCol,
        .infoGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .infoGrid {
          margin: 20px 0;
        }

        .infoGrid div {
          background: #f7f1e6;
          border-radius: 24px;
          padding: 22px;
        }

        .infoGrid p {
          margin-bottom: 0;
        }

        @media (max-width: 950px) {
          .adHero,
          .placementGrid,
          .previewCard,
          .twoCol,
          .infoGrid {
            grid-template-columns: 1fr;
          }

          section,
          .adForm {
            padding: 54px 16px;
          }

          .adHero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 54px;
          }

          .adForm {
            padding: 30px 18px;
          }
        }
      `}</style>
    </main>
  );
}