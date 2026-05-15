"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      let { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!data) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: userData.user.id,
            email: userData.user.email,
            full_name: userData.user.user_metadata?.full_name || "",
            business_name: userData.user.user_metadata?.business_name || "",
            account_type: "vendor",
          })
          .select()
          .single();

        data = newProfile;
      }

      setProfile(data);
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("profiles").update(profile).eq("id", userData.user.id);

    alert("Profile saved successfully.");
  }

  if (!profile) {
    return <main className="authPage">Loading profile...</main>;
  }

  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Vendor Business Profile</p>
          <h1>Your Profile</h1>
          <p className="muted">
            Manage your business name, website, Instagram, bio, and profile details.
          </p>
        </div>
      </section>

      <section className="profileCard">
        <label>
          Full Name
          <input value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
        </label>

        <label>
          Business Name
          <input value={profile.business_name || ""} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} />
        </label>

        <label>
          Website
          <input value={profile.website || ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
        </label>

        <label>
          Instagram
          <input value={profile.instagram || ""} onChange={(e) => setProfile({ ...profile, instagram: e.target.value })} />
        </label>

        <label>
          Bio
          <textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </label>

        <button onClick={saveProfile} className="goldBtn">
          Save Profile
        </button>
      </section>
    </main>
  );
}