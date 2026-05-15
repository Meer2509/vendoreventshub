"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");

      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <p className="authEyebrow">PREMIUM VENDOR ACCESS</p>

        <h1 className="authTitle">
          Login To Your Vendor Account
        </h1>

        <p className="authSubtitle">
          Access your dashboard, events, ratings, and vendor profile.
        </p>

        <form onSubmit={handleLogin} className="authForm">
          <input
            type="email"
            placeholder="Business Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="authInput"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="authInput"
          />

          <button type="submit" className="authButton">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}