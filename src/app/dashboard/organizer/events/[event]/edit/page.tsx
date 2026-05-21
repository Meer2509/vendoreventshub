"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { requireOrganizerOrAdminAccess } from "@/lib/auth";
import {
  EVENT_CATEGORIES,
  VENDOR_FIT_OPTIONS,
  buildEnhancedDescription,
  parseEventDescription,
  type EventFormState,
} from "@/lib/events";

const initialForm: EventFormState = {
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
  vendor_fit: [],
  image_url: "",
  accepting_vendors: true,
};

export default function EditEventPage() {
  const params = useParams();
  const rawEvent = params.event;
  const eventId = Array.isArray(rawEvent) ? rawEvent[0] : (rawEvent as string);

  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [eventPreview, setEventPreview] = useState("");
  const [event, setEvent] = useState<EventFormState>(initialForm);

  useEffect(() => {
    async function loadEvent() {
      const auth = await requireOrganizerOrAdminAccess();
      if (!auth) return;

      let query = supabase.from("events").select("*").eq("id", eventId);

      if (!auth.isAdmin) {
        query = query.eq("created_by", auth.user.id);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        alert("Event not found or you do not have permission to edit it.");
        window.location.href = auth.isAdmin ? "/admin/events" : "/dashboard/organizer";
        return;
      }

      const parsed = parseEventDescription(data.description || "");

      setEvent({
        title: data.title || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        category: data.category || "",
        description: parsed.description,
        booth_price: String(data.booth_price ?? ""),
        expected_visitors: String(data.expected_visitors || ""),
        event_date: data.event_date || "",
        application_deadline: parsed.application_deadline,
        booth_size: parsed.booth_size,
        electricity: parsed.electricity,
        parking: parsed.parking,
        food_rules: parsed.food_rules,
        vendor_fit: parsed.vendor_fit,
        image_url: data.image_url || "",
        accepting_vendors: data.accepting_vendors !== false,
      });
      setEventPreview(data.image_url || "");
      setPageReady(true);
    }

    if (eventId) loadEvent();
  }, [eventId]);

  function updateField(field: keyof EventFormState, value: string | boolean) {
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

    const { data } = supabase.storage.from("event-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleEventImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadEventImage(file);
    if (url) {
      updateField("image_url", url);
      setEventPreview(url);
    }
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const auth = await requireOrganizerOrAdminAccess();
    if (!auth) return;

    let updateQuery = supabase
      .from("events")
      .update({
        title: event.title,
        city: event.city,
        state: event.state,
        zip_code: event.zip_code,
        category: event.category,
        description: buildEnhancedDescription(event),
        booth_price: Number(event.booth_price),
        expected_visitors: event.expected_visitors,
        event_date: event.event_date,
        image_url: event.image_url,
        accepting_vendors: event.accepting_vendors,
      })
      .eq("id", eventId);

    if (!auth.isAdmin) {
      updateQuery = updateQuery.eq("created_by", auth.user.id);
    }

    const { error } = await updateQuery;

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = `/events/${eventId}`;
  }

  const vendorScorePreview = useMemo(() => {
    const booth = Number(event.booth_price || 0);
    const visitors = Number(String(event.expected_visitors).replace(/\D/g, "") || 0);
    let score = 62;
    if (visitors >= 5000) score += 14;
    if (booth > 0 && booth <= 250) score += 8;
    if (event.vendor_fit.length >= 3) score += 5;
    return Math.min(score, 98);
  }, [event]);

  if (!pageReady) {
    return (
      <main className="createEventPage">
        <section className="hero">
          <p className="eyebrow">Edit Event</p>
          <h1>Loading your listing...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="createEventPage">
      <section className="hero">
        <div>
          <p className="eyebrow">Edit Event Listing</p>
          <h1>Update your vendor-facing event details.</h1>
          <p className="heroText">
            Keep booth fees, deadlines, and vendor fit accurate so vendors trust
            your listing.
          </p>
          <div className="heroActions">
            <button
              type="button"
              className="secondary"
              onClick={() => (window.location.href = `/events/${eventId}`)}
            >
              View Public Page
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => (window.location.href = "/dashboard/organizer")}
            >
              Back To Dashboard
            </button>
          </div>
        </div>
        <div className="heroPanel">
          <p className="panelBadge">Vendor Score Preview</p>
          <div className="scoreCircle">{vendorScorePreview}</div>
          <h3>{event.title || "Your Event"}</h3>
        </div>
      </section>

      <form onSubmit={saveEvent} className="eventForm">
        <div className="sectionHead">
          <p className="eyebrow">Event Basics</p>
          <h2>Edit listing details.</h2>
        </div>

        <label>
          Event Name *
          <input
            required
            value={event.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <div className="twoCol">
          <label>
            City *
            <input
              required
              value={event.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </label>
          <label>
            State *
            <input
              required
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
            Category *
            <select
              required
              value={event.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Choose category</option>
              {EVENT_CATEGORIES.map((category) => (
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
              value={event.booth_price}
              onChange={(e) => updateField("booth_price", e.target.value)}
            />
          </label>
          <label>
            Expected Visitors
            <input
              value={event.expected_visitors}
              onChange={(e) => updateField("expected_visitors", e.target.value)}
            />
          </label>
        </div>

        <label style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={event.accepting_vendors}
            onChange={(e) => updateField("accepting_vendors", e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          Accepting vendor applications
        </label>

        <div className="tagGrid">
          {VENDOR_FIT_OPTIONS.map((item) => (
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

        <label>
          Event Cover Image
          <input type="file" accept="image/*" onChange={handleEventImageUpload} />
        </label>
        {eventPreview && (
          <img src={eventPreview} alt="Event preview" className="uploadedPreview" />
        )}

        <label>
          Full Event Description *
          <textarea
            required
            value={event.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </label>

        <button type="submit" className="submitBtn" disabled={loading}>
          {loading ? "Saving..." : "Save Event Changes"}
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
        }
        h1 {
          font-size: clamp(42px, 7vw, 72px);
          line-height: 0.9;
          margin: 12px 0;
        }
        h2 {
          font-size: clamp(30px, 4vw, 48px);
          margin: 0;
        }
        h3 {
          font-size: 24px;
          margin: 0;
        }
        .heroText,
        .sectionHead p {
          color: #5f6b66;
          line-height: 1.7;
        }
        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        button {
          border: 0;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 14px 22px;
          font-weight: 900;
          cursor: pointer;
        }
        button.secondary {
          background: white;
          color: #10291f;
          border: 1px solid #cdbf9f;
        }
        .heroPanel,
        .eventForm {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #eadfc9;
          border-radius: 36px;
          box-shadow: 0 30px 90px rgba(20, 88, 63, 0.13);
        }
        .heroPanel {
          padding: 32px;
          text-align: center;
        }
        .panelBadge {
          display: inline-block;
          background: #10291f;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
        }
        .scoreCircle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 10px solid #b88a2e;
          display: grid;
          place-items: center;
          font-size: 36px;
          font-weight: 900;
          margin: 20px auto;
        }
        .eventForm {
          padding: 40px;
          margin-bottom: 60px;
        }
        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
          margin-bottom: 16px;
        }
        input,
        textarea,
        select {
          border: 1px solid #d8ccb5;
          border-radius: 18px;
          padding: 14px 16px;
          font: inherit;
        }
        textarea {
          min-height: 140px;
        }
        .twoCol,
        .tagGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .tagGrid button {
          background: #f7f1e6;
          color: #10291f;
          border: 1px solid #ded0b5;
        }
        .tagGrid button.active {
          background: #10291f;
          color: white;
        }
        .uploadedPreview {
          width: 100%;
          max-height: 280px;
          object-fit: cover;
          border-radius: 24px;
          margin-bottom: 16px;
        }
        .submitBtn {
          width: 100%;
          margin-top: 12px;
        }
        @media (max-width: 900px) {
          .hero,
          .twoCol,
          .tagGrid {
            grid-template-columns: 1fr;
          }
          section,
          .eventForm {
            padding: 48px 16px;
          }
        }
      `}</style>
    </main>
  );
}
