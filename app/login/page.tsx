"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setMessage("Please enter your email and password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.assign("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://dev-community-app.vercel.app/dashboard",
      },
    });

    setGoogleLoading(false);

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-badge">Welcome Back</p>

        <h1>Login</h1>

        <div className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="button" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? "Opening Google..." : "Continue with Google"}
          </button>
        </div>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}