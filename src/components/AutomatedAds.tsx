"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ad = {
  id: string;
  business_name: string;
  ad_title: string;
  ad_description: string;
  link_url: string;
  image_url: string;
  placement: string;
  expires_at: string;
};

export default function AutomatedAds({
  placement,
  title = "Sponsored Partners",
  limit = 3,
}: {
  placement: string;
  title?: string;
  limit?: number;
}) {
  const [ads, setAds] = useState<Ad[]>([]);

  const visitorId = useMemo(() => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("veh_visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("veh_visitor_id", id);
    }
    return id;
  }, []);

  async function trackAd(ad: Ad, eventType: "view" | "click") {
    await fetch("/api/track-ad", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ad_id: ad.id,
        event_type: eventType,
        placement,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        visitor_id: visitorId,
      }),
    });
  }

  useEffect(() => {
    async function loadAds() {
      const now = new Date().toISOString();

      const { data } = await supabase
        .from("ad_orders")
        .select("*")
        .eq("payment_status", "paid")
        .eq("approval_status", "approved")
        .eq("placement", placement)
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(limit);

      const liveAds = data || [];
      setAds(liveAds);

      liveAds.forEach((ad) => {
        trackAd(ad, "view");
      });
    }

    loadAds();
  }, [placement, limit]);

  if (ads.length === 0) return null;

  return (
    <section className="liveAdsSection">
      <div className="sectionHeader">
        <div>
          <p className="goldEyebrow">Sponsored</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="liveAdsGrid">
        {ads.map((ad) => (
          <article className="liveAdCard" key={ad.id}>
            <div
              className="liveAdImage"
              style={{
                backgroundImage: `url(${
                  ad.image_url ||
                  "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop"
                })`,
              }}
            >
              <span>Sponsored</span>
            </div>

            <div className="liveAdBody">
              <p className="goldEyebrow">{ad.business_name}</p>
              <h3>{ad.ad_title}</h3>
              <p className="muted">{ad.ad_description}</p>

              {ad.link_url && (
                <button
                  className="goldBtn fullWidth"
                  onClick={() => {
                    trackAd(ad, "click");
                    window.open(ad.link_url, "_blank");
                  }}
                >
                  Visit Website
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}