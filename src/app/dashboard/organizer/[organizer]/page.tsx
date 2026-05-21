"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function cleanSocialUrl(type: string, value: string) {
  if (!value) return "";

  if (value.startsWith("http")) return value;

  const cleanValue = value.replace("@", "").trim();

  if (type === "instagram")
    return `https://instagram.com/${cleanValue}`;

  if (type === "tiktok")
    return `https://tiktok.com/@${cleanValue}`;

  if (type === "facebook")
    return `https://facebook.com/${cleanValue}`;

  return value;
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const organizerSlug =
    params.organizer as string;

  const [organizer, setOrganizer] =
    useState<any>(null);

  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadOrganizer() {
      const { data, error } =
        await supabase
          .from("organizer_profiles")
          .select("*")
          .eq("slug", organizerSlug)
          .single();

      if (error || !data) {
        setOrganizer(null);
        setLoading(false);
        return;
      }

      setOrganizer(data);

      const { data: eventData } =
        await supabase
          .from("events")
          .select("*")
          .eq("created_by", data.user_id)
          .order("event_date", {
            ascending: true,
          });

      setEvents(eventData || []);
      setLoading(false);
    }

    loadOrganizer();
  }, [organizerSlug]);

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <h2>Loading organizer...</h2>
        </div>
      </main>
    );
  }

  if (!organizer) {
    return (
      <main className="page">
        <div className="container">
          <h1>Organizer not found</h1>
          <p>
            This organizer profile may
            not exist yet.
          </p>
        </div>
      </main>
    );
  }

  const socialLinks = [
    {
      label: "Website",
      icon: "🌐",
      className: "website",
      url: organizer.website,
    },
    {
      label: "Instagram",
      icon: "📸",
      className: "instagram",
      url: cleanSocialUrl(
        "instagram",
        organizer.instagram
      ),
    },
    {
      label: "TikTok",
      icon: "🎵",
      className: "tiktok",
      url: cleanSocialUrl(
        "tiktok",
        organizer.tiktok
      ),
    },
    {
      label: "Facebook",
      icon: "📘",
      className: "facebook",
      url: cleanSocialUrl(
        "facebook",
        organizer.facebook
      ),
    },
  ].filter((item) => item.url);

  return (
    <main className="page">
      <section
        className="hero"
        style={{
          backgroundImage: `url(${
            organizer.banner_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
          })`,
        }}
      >
        <div className="overlay">
          <div className="container">
            <img
              src={
                organizer.logo_url ||
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop"
              }
              alt={organizer.organizer_name}
              className="logo"
            />

            <p className="eyebrow">
              Event Organizer
            </p>

            <h1>
              {organizer.organizer_name}
            </h1>

            <p className="heroText">
              {organizer.short_description}
            </p>

            <div className="trustRow">
              <span>
                {organizer.city || "City"}
                ,{" "}
                {organizer.state ||
                  "State"}
              </span>

              <span>
                {events.length} Events
              </span>

              <span>
                Trusted Organizer
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="grid">
          <div className="main">
            <div className="card">
              <p className="eyebrow">
                About Organizer
              </p>

              <h2>
                Building trusted vendor
                experiences.
              </h2>

              <p>
                {organizer.full_description ||
                  organizer.short_description}
              </p>
            </div>

            <div className="card">
              <p className="eyebrow">
                Upcoming Events
              </p>

              <h2>
                Events by this organizer
              </h2>

              <div className="eventGrid">
                {events.length === 0 ? (
                  <p>
                    No events listed yet.
                  </p>
                ) : (
                  events.map((event) => (
                    <div
                      className="eventCard"
                      key={event.id}
                    >
                      <h3>
                        {event.title}
                      </h3>

                      <p>
                        {event.city},{" "}
                        {event.state}
                      </p>

                      <p>
                        Booth: $
                        {event.booth_price ||
                          "TBD"}
                      </p>

                      <button
                        onClick={() =>
                          (window.location.href =
                            `/events/${event.id}`)
                        }
                      >
                        View Event
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="sidebar">
            {socialLinks.length >
              0 && (
              <div className="card">
                <p className="eyebrow">
                  Connect
                </p>

                <div className="socialGrid">
                  {socialLinks.map(
                    (item) => (
                      <button
                        key={
                          item.label
                        }
                        className={`socialButton ${item.className}`}
                        onClick={() =>
                          window.open(
                            item.url,
                            "_blank"
                          )
                        }
                      >
                        {item.icon}{" "}
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="card">
              <p className="eyebrow">
                Organizer Snapshot
              </p>

              <div className="sidebarInfo">
                <span>
                  City
                </span>
                <strong>
                  {organizer.city ||
                    "N/A"}
                </strong>
              </div>

              <div className="sidebarInfo">
                <span>
                  State
                </span>
                <strong>
                  {organizer.state ||
                    "N/A"}
                </strong>
              </div>

              <div className="sidebarInfo">
                <span>
                  Events
                </span>
                <strong>
                  {events.length}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .page {
          background: #f7f1e6;
          color: #10291f;
          min-height: 100vh;
        }

        .container,
        .content {
          max-width: 1180px;
          margin: auto;
          padding: 70px 18px;
        }

        .hero {
          min-height: 75vh;
          background-size: cover;
          background-position: center;
        }

        .overlay {
          background: rgba(
            16,
            41,
            31,
            0.78
          );
          min-height: 75vh;
          display: flex;
          align-items: center;
        }

        .logo {
          width: 130px;
          height: 130px;
          border-radius: 28px;
          object-fit: cover;
          border: 5px solid white;
          margin-bottom: 24px;
        }

        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        h1 {
          color: white;
          font-size: clamp(
            54px,
            8vw,
            92px
          );
          line-height: 0.9;
        }

        h2 {
          font-size: 44px;
        }

        .heroText {
          color: rgba(
            255,
            255,
            255,
            0.86
          );
          max-width: 700px;
        }

        .trustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .trustRow span {
          background: rgba(
            255,
            255,
            255,
            0.75
          );
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 800;
        }

        .grid {
          display: grid;
          grid-template-columns:
            1fr 340px;
          gap: 22px;
        }

        .main,
        .sidebar {
          display: grid;
          gap: 22px;
        }

        .card {
          background: white;
          border-radius: 30px;
          padding: 30px;
          border: 1px solid #eadfc9;
        }

        .eventGrid {
          display: grid;
          gap: 14px;
        }

        .eventCard {
          background: #f7f1e6;
          padding: 20px;
          border-radius: 20px;
        }

        .socialGrid {
          display: grid;
          gap: 10px;
        }

        .socialButton {
          border: 0;
          border-radius: 20px;
          padding: 16px;
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .website {
          background: #10291f;
        }

        .instagram {
          background: linear-gradient(
            135deg,
            #833ab4,
            #fd1d1d,
            #fcb045
          );
        }

        .tiktok {
          background: black;
        }

        .facebook {
          background: #1877f2;
        }

        .sidebarInfo {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        button {
          border: 0;
          background: #10291f;
          color: white;
          padding: 14px 18px;
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 980px) {
          .grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 54px;
          }
        }
      `}</style>
    </main>
  );
}