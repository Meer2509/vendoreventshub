"use client";

import Link from "next/link";

const plans = [
  {
    name: "Founding Vendor",
    price: "Complimentary",
    sub: "Lifetime founding access",
    badge: "First 80 Vendors",
    remaining: "62 spots remaining",
    description:
      "For vendors who want to discover better events, avoid bad booths, save opportunities, and build a trusted public profile.",
    features: [
      "Premium vendor profile",
      "Save events to your dashboard",
      "Leave verified event reviews",
      "Upload logo, banner, and business details",
      "Founding Vendor badge",
      "Early access to Vendor Profit Score",
      "Priority placement in future vendor directory",
    ],
    cta: "Claim Vendor Founder Spot",
    link: "/signup",
    featured: false,
  },
  {
    name: "Founding Organizer",
    price: "Complimentary",
    sub: "Lifetime founding access",
    badge: "First 50 Organizers",
    remaining: "37 spots remaining",
    description:
      "For festivals, fairs, markets, expos, and event organizers who want to attract serious vendors and build trust.",
    features: [
      "Unlimited event listings",
      "Vendor application visibility",
      "Organizer trust profile",
      "Featured founder badge",
      "Promote booth pricing and deadlines",
      "Build reputation with vendor reviews",
      "Lifetime early access benefits",
    ],
    cta: "Claim Organizer Founder Spot",
    link: "/create-event",
    featured: true,
  },
  {
    name: "Premium Ads",
    price: "From $49/mo",
    sub: "Launch revenue plan",
    badge: "Sponsored Growth",
    remaining: "Limited launch placements",
    description:
      "Put your event, vendor brand, food truck, service, or local business in front of event-ready vendors and organizers.",
    features: [
      "Homepage sponsored placement",
      "Vendor directory exposure",
      "Event page visibility",
      "Sponsored business badge",
      "Premium ad image upload",
      "Category and city sponsorships coming soon",
      "Designed for high-intent local traffic",
    ],
    cta: "Advertise Now",
    link: "/advertise",
    featured: false,
  },
];

const comparison = [
  ["Premium profile", "Yes", "Yes", "Sponsored"],
  ["Verified reviews", "Yes", "Yes", "—"],
  ["Event discovery", "Yes", "Yes", "—"],
  ["Organizer reputation", "View", "Build", "—"],
  ["Homepage exposure", "Future upgrade", "Future upgrade", "Yes"],
  ["Founder badge", "Yes", "Yes", "Sponsored badge"],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8b6b2f55,transparent_42%),linear-gradient(135deg,#111,#050505)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
              Founding Member Launch
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Become a founding member of America’s vendor event intelligence platform.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
              VendorEventsHub helps vendors discover better events, avoid bad booths,
              compare organizer reputation, and grow with smarter event decisions.
              Early vendors and organizers receive complimentary founding access before
              premium plans begin.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#d6b25e] px-8 py-4 text-center font-semibold text-black shadow-[0_0_40px_rgba(214,178,94,0.28)] transition hover:scale-[1.02]"
              >
                Claim Free Vendor Spot
              </Link>

              <Link
                href="/create-event"
                className="rounded-full border border-white/20 px-8 py-4 text-center font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Claim Organizer Spot
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {["80 Vendor Spots", "50 Organizer Spots", "Founder Badge"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm text-white/75 backdrop-blur"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d6b25e]/25 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d6b25e]">
              Limited Access
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              Founder spots are designed to build the first trusted vendor network.
            </h2>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm text-white/70">
                  <span>Vendor Founder Spots</span>
                  <strong className="text-white">62 / 80 remaining</strong>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[78%] rounded-full bg-[#d6b25e]" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm text-white/70">
                  <span>Organizer Founder Spots</span>
                  <strong className="text-white">37 / 50 remaining</strong>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[74%] rounded-full bg-[#d6b25e]" />
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                ["ROI", "Smarter event choices"],
                ["Trust", "Verified reputation"],
                ["Safety", "Scam-aware platform"],
                ["Growth", "Premium exposure"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <strong className="block text-2xl text-[#d6b25e]">{title}</strong>
                  <span className="text-sm text-white/65">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
              Launch Pricing
            </p>
            <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
              Join early. Build trust first. Grow before premium pricing begins.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[2rem] border p-7 ${
                  plan.featured
                    ? "border-[#d6b25e] bg-[#d6b25e] text-black shadow-[0_0_50px_rgba(214,178,94,0.22)]"
                    : "border-white/10 bg-white/[0.04] text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest ${
                      plan.featured
                        ? "bg-black text-[#d6b25e]"
                        : "bg-[#d6b25e]/15 text-[#d6b25e]"
                    }`}
                  >
                    {plan.badge}
                  </p>
                </div>

                <h3 className="mt-7 text-2xl font-semibold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <p
                    className={`mt-1 text-sm ${
                      plan.featured ? "text-black/65" : "text-white/55"
                    }`}
                  >
                    {plan.sub}
                  </p>
                </div>

                <p
                  className={`mt-5 min-h-[96px] leading-7 ${
                    plan.featured ? "text-black/75" : "text-white/65"
                  }`}
                >
                  {plan.description}
                </p>

                <p
                  className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
                    plan.featured
                      ? "bg-black/10 text-black"
                      : "bg-white/5 text-white/75"
                  }`}
                >
                  {plan.remaining}
                </p>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6">
                      <span>{plan.featured ? "◆" : "✓"}</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.link}
                  className={`mt-8 block rounded-full px-6 py-4 text-center font-semibold transition hover:scale-[1.02] ${
                    plan.featured
                      ? "bg-black text-white"
                      : "bg-[#d6b25e] text-black"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
            Why Join Early
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold">
            Founding members get the advantage before the platform becomes crowded.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["Avoid Bad Booths", "Help vendors make smarter booking decisions."],
              ["Build Reputation", "Give organizers and vendors trusted profiles."],
              ["Increase ROI", "Focus on events with stronger vendor opportunity."],
              ["Get Priority", "Founder profiles can rank higher as we grow."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-black/30 p-6"
              >
                <h3 className="text-xl font-semibold text-[#d6b25e]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
              Compare Access
            </p>
            <h2 className="mt-4 text-4xl font-semibold">
              Choose the access that fits your growth.
            </h2>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10">
            <table className="w-full min-w-[720px] border-collapse bg-white/[0.04]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-5 text-white/70">Feature</th>
                  <th className="p-5 text-[#d6b25e]">Vendor</th>
                  <th className="p-5 text-[#d6b25e]">Organizer</th>
                  <th className="p-5 text-[#d6b25e]">Ads</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row[0]} className="border-b border-white/10">
                    {row.map((cell) => (
                      <td key={cell} className="p-5 text-sm text-white/75">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[#d6b25e] p-10 text-center text-black md:p-16">
          <p className="text-sm font-bold uppercase tracking-[0.35em]">
            Founder Access Is Open
          </p>
          <h2 className="mt-5 text-4xl font-bold md:text-6xl">
            Join before VendorEventsHub becomes the standard for vendor event decisions.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/70">
            The first vendors and organizers help shape the platform, build early
            reputation, and receive founding access before premium memberships begin.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-black px-8 py-4 font-semibold text-white"
            >
              Claim Vendor Spot
            </Link>
            <Link
              href="/create-event"
              className="rounded-full border border-black/25 px-8 py-4 font-semibold"
            >
              Claim Organizer Spot
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}