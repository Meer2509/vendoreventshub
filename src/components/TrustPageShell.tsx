"use client";

import Link from "next/link";

type TrustPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
};

export default function TrustPageShell({
  eyebrow,
  title,
  intro,
  children,
}: TrustPageShellProps) {
  return (
    <main className="trustPage">
      <section className="trustHero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="heroText">{intro}</p>
        <p className="trustMission">
          VendorEventsHub is a vendor intelligence platform helping vendors
          compare events before applying — with booth fees, traffic signals,
          organizer transparency, and real vendor experience when available.
        </p>
        <div className="trustActions">
          <Link href="/events" className="goldBtn">
            Explore Events
          </Link>
          <Link href="/signup" className="outlineBtn">
            Join Free
          </Link>
        </div>
      </section>

      <section className="trustContent">{children}</section>

      <style jsx>{`
        .trustPage {
          background:
            radial-gradient(circle at top left, rgba(184, 138, 46, 0.16), transparent 34%),
            radial-gradient(circle at top right, rgba(16, 41, 31, 0.1), transparent 30%),
            #f7f1e6;
          color: #10291f;
        }
        .trustHero,
        .trustContent {
          max-width: 900px;
          margin: 0 auto;
          padding: 72px 18px;
        }
        .eyebrow {
          color: #b88a2e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          font-size: clamp(40px, 7vw, 72px);
          line-height: 0.92;
          letter-spacing: -0.06em;
          margin: 12px 0;
        }
        .heroText,
        .trustMission,
        .trustContent :global(p),
        .trustContent :global(li) {
          color: #5f6b66;
          line-height: 1.75;
        }
        .trustMission {
          margin-top: 20px;
          font-size: 17px;
        }
        .trustActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }
        .trustActions :global(a) {
          text-decoration: none;
          border-radius: 999px;
          padding: 14px 22px;
          font-weight: 900;
        }
        .trustActions :global(.goldBtn) {
          background: #10291f;
          color: white;
        }
        .trustActions :global(.outlineBtn) {
          background: white;
          color: #10291f;
          border: 1px solid #cdbf9f;
        }
        .trustContent {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #eadfc9;
          border-radius: 32px;
          box-shadow: 0 24px 70px rgba(16, 41, 31, 0.1);
          margin-bottom: 72px;
        }
        .trustContent :global(h2) {
          font-size: 28px;
          margin: 28px 0 12px;
        }
        .trustContent :global(ul) {
          padding-left: 20px;
        }
        @media (max-width: 700px) {
          .trustHero,
          .trustContent {
            padding: 48px 16px;
          }
          h1 {
            font-size: 40px;
          }
        }
      `}</style>
    </main>
  );
}
