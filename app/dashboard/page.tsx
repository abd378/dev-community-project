"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserEmail(user.email || "");
    setUserName(user.user_metadata.full_name || "Student");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <div className="dashboard-top">
          <div>
            <p className="dashboard-badge">Student Dashboard</p>
            <h1>Welcome, {userName} 👋</h1>
            <p className="dashboard-email">{userEmail}</p>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="dashboard-grid">
          <Link href="/profile" className="dashboard-box">
            <h3>Profile</h3>
            <p>Manage your developer profile and personal information.</p>
          </Link>

          <Link href="/developers" className="dashboard-box">
            <h3>Developers</h3>
            <p>Search and view public developer profiles.</p>
          </Link>

          <Link href="/posts" className="dashboard-box">
            <h3>Posts</h3>
            <p>Share updates, ideas, and projects with the community.</p>
          </Link>

          <Link href="/projects" className="dashboard-box">
            <h3>Projects</h3>
            <p>Add your portfolio projects, GitHub repositories, and live demos.</p>
          </Link>

          <Link href="/communities" className="dashboard-box">
            <h3>Communities</h3>
            <p>Join developer communities and interact with students.</p>
          </Link>

          <Link href="/topics" className="dashboard-box">
            <h3>Topics</h3>
            <p>Explore programming topics and save your favorites.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}