"use client";

export default function AdminSettingsPage() {
  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Settings</p>
        <h1>Brand & launch controls</h1>
        <p className="adminMuted">
          Placeholder panel — connect a <code>platform_settings</code> table in
          Supabase before enabling live writes.
        </p>
      </section>

      <section className="adminPanel">
        <h2>Brand assets</h2>
        <ul className="adminMuted">
          <li>Logo — upload to <code>public/</code> or Supabase storage</li>
          <li>Favicon — <code>src/app/icon.svg</code> (see public/BRAND_ASSETS.md)</li>
          <li>Open Graph — <code>public/og-image.png</code> (1200×630)</li>
        </ul>
      </section>

      <section className="adminPanel">
        <h2>Homepage copy</h2>
        <p className="adminMuted">Homepage headline (current):</p>
        <strong>Find Vendor Events Worth Your Time &amp; Money</strong>
        <p className="adminMuted" style={{ marginTop: 16 }}>
          Launch banner: Launching in Connecticut — expanding nationwide
        </p>
      </section>

      <section className="adminPanel">
        <h2>Social links</h2>
        <p className="adminMuted">
          Footer and about page links are static until a settings table exists.
        </p>
      </section>
    </main>
  );
}
