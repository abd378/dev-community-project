"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Developer = {
  id: string;
  full_name: string;
  university: string;
  major: string;
  bio: string;
  avatar_url: string;
};

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDevelopers(data);
    }

    setLoading(false);
  };

  const filteredDevelopers = developers.filter((developer) => {
    const text = `${developer.full_name || ""} ${developer.major || ""} ${
      developer.university || ""
    } ${developer.bio || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main className="developers-page">
      <section className="developers-container">
        <div className="developers-header">
          <p className="developers-badge">Developer Community</p>

          <h1>Meet Our Developers</h1>

          <p>
            Search and discover talented student developers by name, major,
            university, or skills.
          </p>

          <input
            className="developers-search"
            type="text"
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="developers-loading">Loading developers...</p>
        ) : filteredDevelopers.length === 0 ? (
          <p className="developers-loading">No developers found.</p>
        ) : (
          <div className="developers-grid">
            {filteredDevelopers.map((developer) => (
              <div className="developer-card" key={developer.id}>
                <div className="developer-avatar-box">
                  {developer.avatar_url ? (
                    <img
                      src={developer.avatar_url}
                      alt={developer.full_name || "Developer"}
                      className="developer-avatar"
                    />
                  ) : (
                    <div className="developer-avatar-placeholder">
                      {developer.full_name
                        ? developer.full_name.charAt(0).toUpperCase()
                        : "D"}
                    </div>
                  )}
                </div>

                <h2>{developer.full_name || "Developer"}</h2>

                <p className="developer-major">
                  {developer.major || "Student Developer"}
                </p>

                <p className="developer-university">
                  {developer.university || "Developer Community"}
                </p>

                <p className="developer-bio">
                  {developer.bio ||
                    "Passionate about software development and technology."}
                </p>

                <div className="developer-actions">
                  <Link href={`/developers/${developer.id}`}>
                    <button>View Profile</button>
                  </Link>

                  <Link href={`/chat/${developer.id}`}>
                    <button>Message</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}