"use client";

import { useState } from "react";
import Link from "next/link";
import Turnstile from "react-turnstile";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setMessage("");
    setLoading(true);

    if (!fullName || !email || !password) {
      setMessage("Please fill all fields.");
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setMessage("Please verify that you are human.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    alert("Account created successfully.");
    window.location.href = "/login";
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-badge">Join DevHub</p>

        <h1>Create Account</h1>

        <div className="auth-form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Turnstile
            sitekey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
            }
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
          />

          <button onClick={handleSignup} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          {message && <p>{message}</p>}
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}