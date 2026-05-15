"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [eventPreview, setEventPreview] = useState("");

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
    image_url: "",
  });

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
      setEvent({ ...event, image_url: url });
      setEventPreview(url);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("events").insert({
      title: event.title,
      city: event.city,
      state: event.state,
      zip_code: event.zip_code,
      category: event.category,
      description: event.description,
      booth_price: Number(event.booth_price),
      expected_visitors: event.expected_visitors,
      event_date: event.event_date,
      image_url: event.image_url,
      is_featured: false,
      created_by: userData.user.id,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Event submitted successfully!");
    window.location.href = "/events";
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Festival & Event Registration</p>
          <h1>List Your Event</h1>
          <p className="muted">
            Add your festival, fair, market, expo, or vendor event so businesses
            can discover, review, save, and apply.
          </p>
        </div>
      </section>

      <form onSubmit={createEvent} className="eventCreateCard">
        <div className="formSectionTitle">
          <p className="goldEyebrow">Event Basics</p>
          <h2>Tell vendors what makes your event worth attending.</h2>
        </div>

        <label>
          Event Name
          <input
            required
            placeholder="Example: Litchfield Hills Artisan Festival"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
          />
        </label>

        <div className="twoColumnForm">
          <label>
            City
            <input
              required
              placeholder="Litchfield"
              value={event.city}
              onChange={(e) => setEvent({ ...event, city: e.target.value })}
            />
          </label>

          <label>
            State
            <input
              required
              placeholder="CT"
              value={event.state}
              onChange={(e) => setEvent({ ...event, state: e.target.value })}
            />
          </label>
        </div>

        <div className="twoColumnForm">
          <label>
            ZIP Code
            <input
              required
              placeholder="06759"
              value={event.zip_code}
              onChange={(e) => setEvent({ ...event, zip_code: e.target.value })}
            />
          </label>

          <label>
            Event Date
            <input
              required
              type="date"
              value={event.event_date}
              onChange={(e) =>
                setEvent({ ...event, event_date: e.target.value })
              }
            />
          </label>
        </div>

        <label>
          Event Category
          <select
            required
            value={event.category}
            onChange={(e) => setEvent({ ...event, category: e.target.value })}
          >
            <option value="">Choose category</option>
            <option>Festival</option>
            <option>Farmers Market</option>
            <option>Craft Fair</option>
            <option>Flea Market</option>
            <option>Food Truck Event</option>
            <option>Holiday Market</option>
            <option>Expo</option>
            <option>Community Fair</option>
            <option>Artisan Market</option>
          </select>
        </label>

        <div className="twoColumnForm">
          <label>
            Booth Price
            <input
              required
              type="number"
              placeholder="75"
              value={event.booth_price}
              onChange={(e) =>
                setEvent({ ...event, booth_price: e.target.value })
              }
            />
          </label>

          <label>
            Expected Visitors
            <input
              placeholder="Example: 8,500+"
              value={event.expected_visitors}
              onChange={(e) =>
                setEvent({ ...event, expected_visitors: e.target.value })
              }
            />
          </label>
        </div>

        <label>
          Event Cover Image — recommended 1600 x 900 px
          <input type="file" accept="image/*" onChange={handleEventImageUpload} />
        </label>

        {eventPreview && (
          <img
            src={eventPreview}
            alt="Event cover preview"
            style={{
              width: "100%",
              height: "320px",
              objectFit: "cover",
              borderRadius: "28px",
            }}
          />
        )}

        <label>
          Full Event Description
          <textarea
            required
            placeholder="Describe booth setup, vendor rules, expected crowd, application process, food vendor rules, parking, electricity, deadlines, and why vendors should attend."
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
          />
        </label>

        <div className="eventInfoGrid">
          <div>
            <strong>Recommended Details</strong>
            <p>
              Vendor deadlines, indoor/outdoor setup, parking, electricity,
              booth size, handmade-only rules, food permits, and expected
              traffic.
            </p>
          </div>

          <div>
            <strong>Premium Visibility</strong>
            <p>
              Later, organizers will be able to boost listings, buy homepage
              ads, and sponsor city/category pages.
            </p>
          </div>
        </div>

        <button type="submit" className="goldBtn createEventBtn">
          {loading ? "Submitting Event..." : "Submit Event"}
        </button>
      </form>
    </main>
  );
}