"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setMessage("");
    setLoading(true);

    if (!fullName || !email || !password) {
      setLoading(false);
      setMessage("Please fill all fields.");
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
      alert(error.message);
      return;
    }

    alert("Account created successfully. Now login.");
    window.location.assign("/login");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-badge">Join DevHub</p>
        <h1>Create Account</h1>

        <div className="auth-form">
          <input
            type="text"
            placeholder="Full name"
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
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="button" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}