"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { requireOrganizerAccess } from "@/lib/auth";

const categories = [
  "Festival",
  "Farmers Market",
  "Craft Fair",
  "Flea Market",
  "Food Truck Event",
  "Holiday Market",
  "Expo",
  "Community Fair",
  "Artisan Market",
  "Wellness Event",
  "Pop-Up Market",
  "Trade Show",
];

const vendorFitOptions = [
  "Food",
  "Coffee",
  "Handmade",
  "Jewelry",
  "Art",
  "Wellness",
  "Boutique",
  "Farm",
  "Desserts",
  "Home Goods",
  "Beauty",
  "Pet Products",
];

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [eventPreview, setEventPreview] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const auth = await requireOrganizerAccess();
      if (!auth) return;

      setAuthChecked(true);
    }

    checkAuth();
  }, []);

  const [event, setEvent] = useState({
    title: "",
    city: "",
    state: "",
    zip_code: "",
    category: "",
    description: "",
    booth_price: "",
    expected_visitors: "",
    event_date: "",
    application_deadline: "",
    booth_size: "",
    electricity: "",
    parking: "",
    food_rules: "",
    vendor_fit: [] as string[],
    image_url: "",
  });

  const vendorScorePreview = useMemo(() => {
    const booth = Number(event.booth_price || 0);
    const visitors = Number(String(event.expected_visitors).replace(/\D/g, "") || 0);

    let score = 62;

    if (visitors >= 10000) score += 18;
    else if (visitors >= 5000) score += 14;
    else if (visitors >= 1000) score += 9;
    else if (visitors > 0) score += 5;

    if (booth > 0 && booth <= 100) score += 12;
    else if (booth <= 250) score += 8;
    else if (booth <= 500) score += 4;

    if (event.vendor_fit.length >= 4) score += 5;
    if (event.application_deadline) score += 3;

    return Math.min(score, 98);
  }, [event]);

  function updateField(field: string, value: string) {
    setEvent((prev) => ({ ...prev, [field]: value }));
  }

  function toggleVendorFit(item: string) {
    setEvent((prev) => {
      const exists = prev.vendor_fit.includes(item);
      return {
        ...prev,
        vendor_fit: exists
          ? prev.vendor_fit.filter((fit) => fit !== item)
          : [...prev.vendor_fit, item],
      };
    });
  }

  async function uploadEventImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("event-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleEventImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadEventImage(file);

    if (url) {
      setEvent((prev) => ({ ...prev, image_url: url }));
      setEventPreview(url);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const auth = await requireOrganizerAccess();
    if (!auth) return;

    const enhancedDescription = `
${event.description}

Vendor Details:
- Application Deadline: ${event.application_deadline || "Not provided"}
- Booth Size: ${event.booth_size || "Not provided"}
- Electricity: ${event.electricity || "Not provided"}
- Parking: ${event.parking || "Not provided"}
- Food Vendor Rules: ${event.food_rules || "Not provided"}
- Best Vendor Fit: ${event.vendor_fit.join(", ") || "Not provided"}
`.trim();

    const { data: created, error } = await supabase
      .from("events")
      .insert({
        title: event.title,
        city: event.city,
        state: event.state,
        zip_code: event.zip_code,
        category: event.category,
        description: enhancedDescription,
        booth_price: Number(event.booth_price),
        expected_visitors: event.expected_visitors,
        event_date: event.event_date,
        image_url: event.image_url,
        is_featured: false,
        created_by: auth.user.id,
      })
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Event submitted successfully!");
    window.location.href = created?.id
      ? `/events/${created.id}`
      : "/dashboard/organizer";
  }

  if (!authChecked) {
    return (
      <main className="createEventPage">
        <section className="hero">
          <p className="eyebrow">Organizer Event Listing</p>
          <h1>Checking your account...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="createEventPage">
      <section className="hero">
        <div>
          <p className="eyebrow">Organizer Event Listing</p>
          <h1>List your event where vendors are ready to discover it.</h1>
          <p className="heroText">
            Add your festival, fair, market, expo, pop-up, or vendor event with
            the details vendors need before they commit: booth fees, traffic,
            deadlines, setup rules, category fit, and organizer information.
          </p>

          <div className="heroActions">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("event-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start Event Listing
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => (window.location.href = "/dashboard/organizer")}
            >
              Organizer Dashboard
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => (window.location.href = "/pricing")}
            >
              View Promotion Options
            </button>
          </div>

          <div className="trustRow">
            <span>Vendor Discovery</span>
            <span>Booth Transparency</span>
            <span>Organizer Trust</span>
          </div>
        </div>

        <div className="heroPanel">
          <p className="panelBadge">Event Intelligence Preview</p>
          <h3>{event.title || "Your Event Listing"}</h3>

          <div className="scoreCircle">{vendorScorePreview}</div>

          <div className="miniStats">
            <div>
              <strong>{event.booth_price ? `$${event.booth_price}` : "TBD"}</strong>
              <span>Booth Fee</span>
            </div>
            <div>
              <strong>{event.expected_visitors || "TBD"}</strong>
              <span>Expected Visitors</span>
            </div>
            <div>
              <strong>{event.vendor_fit.length || 0}</strong>
              <span>Vendor Fits</span>
            </div>
            <div>
              <strong>{event.category || "Category"}</strong>
              <span>Event Type</span>
            </div>
          </div>
        </div>
      </section>

      <section className="previewSection">
        <div className="sectionHead">
          <p className="eyebrow">Live Event Preview</p>
          <h2>Your event should look premium before vendors even apply.</h2>
        </div>

        <article className="eventPreviewCard">
          <div
            className="previewImage"
            style={{
              backgroundImage: `url(${
                eventPreview ||
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop"
              })`,
            }}
          >
            <span>{vendorScorePreview}/100 Vendor Score</span>
          </div>

          <div className="previewBody">
            <p className="eyebrow">{event.category || "Event Category"}</p>
            <h3>{event.title || "Your Premium Event Title"}</h3>
            <p>
              {event.description ||
                "Your event description will preview here so organizers can see how the listing appears to vendors."}
            </p>

            <div className="previewPills">
              <span>{event.city || "City"}, {event.state || "State"}</span>
              <span>{event.event_date || "Event Date"}</span>
              <span>{event.booth_price ? `$${event.booth_price} Booth` : "Booth Fee TBD"}</span>
              <span>{event.expected_visitors || "Traffic TBD"}</span>
            </div>

            {event.vendor_fit.length > 0 && (
              <div className="fitPreview">
                <strong>Best Vendor Fit</strong>
                <div>
                  {event.vendor_fit.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <form id="event-form" onSubmit={createEvent} className="eventForm">
        <div className="sectionHead">
          <p className="eyebrow">Event Basics</p>
          <h2>Tell vendors why your event is worth attending.</h2>
          <p>
            Strong event details help vendors understand the opportunity faster
            and build trust before they book a booth.
          </p>
        </div>

        <label>
          Event Name *
          <input
            required
            placeholder="Example: Litchfield Hills Artisan Festival"
            value={event.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <div className="twoCol">
          <label>
            City *
            <input
              required
              placeholder="Litchfield"
              value={event.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </label>

          <label>
            State *
            <input
              required
              placeholder="CT"
              value={event.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </label>
        </div>

        <div className="twoCol">
          <label>
            ZIP Code *
            <input
              required
              placeholder="06759"
              value={event.zip_code}
              onChange={(e) => updateField("zip_code", e.target.value)}
            />
          </label>

          <label>
            Event Date *
            <input
              required
              type="date"
              value={event.event_date}
              onChange={(e) => updateField("event_date", e.target.value)}
            />
          </label>
        </div>

        <div className="twoCol">
          <label>
            Event Category *
            <select
              required
              value={event.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Application Deadline
            <input
              type="date"
              value={event.application_deadline}
              onChange={(e) => updateField("application_deadline", e.target.value)}
            />
          </label>
        </div>

        <div className="twoCol">
          <label>
            Booth Price *
            <input
              required
              type="number"
              placeholder="75"
              value={event.booth_price}
              onChange={(e) => updateField("booth_price", e.target.value)}
            />
          </label>

          <label>
            Expected Visitors
            <input
              placeholder="Example: 8,500+"
              value={event.expected_visitors}
              onChange={(e) => updateField("expected_visitors", e.target.value)}
            />
          </label>
        </div>

        <div className="sectionDivider">
          <p className="eyebrow">Vendor Fit</p>
          <h3>Which vendors are the best fit for this event?</h3>
        </div>

        <div className="tagGrid">
          {vendorFitOptions.map((item) => (
            <button
              key={item}
              type="button"
              className={event.vendor_fit.includes(item) ? "active" : ""}
              onClick={() => toggleVendorFit(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sectionDivider">
          <p className="eyebrow">Vendor Details</p>
          <h3>Details that help vendors trust your listing.</h3>
        </div>

        <div className="twoCol">
          <label>
            Booth Size
            <input
              placeholder="Example: 10x10"
              value={event.booth_size}
              onChange={(e) => updateField("booth_size", e.target.value)}
            />
          </label>

          <label>
            Electricity Available?
            <select
              value={event.electricity}
              onChange={(e) => updateField("electricity", e.target.value)}
            >
              <option value="">Select option</option>
              <option>Yes</option>
              <option>No</option>
              <option>Limited availability</option>
              <option>Contact organizer</option>
            </select>
          </label>
        </div>

        <div className="twoCol">
          <label>
            Parking / Load-In Notes
            <input
              placeholder="Example: Vendor parking behind main field"
              value={event.parking}
              onChange={(e) => updateField("parking", e.target.value)}
            />
          </label>

          <label>
            Food Vendor Rules
            <input
              placeholder="Example: Permit required / food trucks welcome"
              value={event.food_rules}
              onChange={(e) => updateField("food_rules", e.target.value)}
            />
          </label>
        </div>

        <label>
          Event Cover Image — recommended 1600 x 900 px
          <input type="file" accept="image/*" onChange={handleEventImageUpload} />
        </label>

        {eventPreview && (
          <img src={eventPreview} alt="Event cover preview" className="uploadedPreview" />
        )}

        <label>
          Full Event Description *
          <textarea
            required
            placeholder="Describe booth setup, vendor rules, expected crowd, application process, parking, electricity, deadlines, and why vendors should attend."
            value={event.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <div className="infoGrid">
          <div>
            <strong>Recommended Details</strong>
            <p>
              Add vendor deadlines, booth size, indoor/outdoor setup, parking,
              electricity, food permits, traffic expectations, and audience fit.
            </p>
          </div>

          <div>
            <strong>Premium Visibility</strong>
            <p>
              Want more vendor attention? Use premium ads and sponsored
              placements after listing your event.
            </p>
          </div>
        </div>

        <button type="submit" className="submitBtn" disabled={loading}>
          {loading ? "Submitting Event..." : "Submit Event Listing"}
        </button>
      </form>

      <style jsx>{`
        .createEventPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.18), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.12), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }

        section,
        .eventForm {
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 18px;
        }

        .hero {
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
        .previewBody p,
        .eventForm p {
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
        .eventPreviewCard,
        .eventForm {
          background: rgba(255, 255, 255, 0.86);
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

        .miniStats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .miniStats div {
          background: #f7f1e6;
          border-radius: 22px;
          padding: 16px;
        }

        .miniStats strong {
          display: block;
          font-size: 24px;
          letter-spacing: -0.04em;
        }

        .miniStats span {
          color: #5f6b66;
          font-size: 13px;
          font-weight: 800;
        }

        .sectionHead {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .eventPreviewCard {
          display: grid;
          grid-template-columns: minmax(280px, 42%) 1fr;
          overflow: hidden;
        }

        .previewImage {
          min-height: 380px;
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
        }

        .previewPills,
        .fitPreview div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .previewPills span,
        .fitPreview span {
          border: 1px solid #ded0b5;
          border-radius: 999px;
          padding: 8px 11px;
          font-size: 12px;
          font-weight: 850;
          background: #f7f1e6;
        }

        .fitPreview {
          margin-top: 22px;
        }

        .fitPreview strong {
          display: block;
          margin-bottom: 8px;
        }

        .eventForm {
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
        .infoGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .sectionDivider {
          margin: 32px 0 18px;
        }

        .tagGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
        }

        .tagGrid button {
          background: rgba(255, 255, 255, 0.65);
          color: #10291f;
          border: 1px solid #d8ccb5;
          padding: 11px 15px;
        }

        .tagGrid button.active {
          background: #10291f;
          color: white;
          border-color: #10291f;
        }

        .uploadedPreview {
          width: 100%;
          height: 340px;
          object-fit: cover;
          border-radius: 28px;
          border: 1px solid #eadfc9;
          margin: 10px 0 22px;
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

        .submitBtn {
          width: 100%;
          margin-top: 10px;
        }

        @media (max-width: 950px) {
          .hero,
          .eventPreviewCard,
          .twoCol,
          .infoGrid {
            grid-template-columns: 1fr;
          }

          section,
          .eventForm {
            padding: 54px 16px;
          }

          .hero {
            min-height: auto;
            padding-top: 44px;
          }

          h1 {
            font-size: 54px;
          }

          .eventForm {
            padding: 30px 18px;
          }

          .miniStats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}