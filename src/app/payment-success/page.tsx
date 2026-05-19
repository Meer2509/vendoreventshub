"use client";

export default function PaymentSuccessPage() {
  return (
    <main className="dashboardPage">
      <section className="dashboardHero">
        <div>
          <p className="goldEyebrow">Payment Received</p>
          <h1>Your ad request was submitted.</h1>
          <p className="muted">
            Thank you. Your premium ad placement is now pending approval. Once
            approved, your ad will go live on VendorEventsHub.
          </p>
        </div>

        <button
          className="goldBtn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go To Dashboard
        </button>
      </section>
    </main>
  );
}