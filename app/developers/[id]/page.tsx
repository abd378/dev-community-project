"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Developer = {
  id: string;
  full_name: string;
  university: string;
  major: string;
  bio: string;
  avatar_url: string;
  email: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  github_url: string;
  live_url: string;
  created_at: string;
};

type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
};

export default function PublicDeveloperProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [follow, setFollow] = useState<Follow | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDeveloperData();
  }, []);

  const loadDeveloperData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setCurrentUserId(user.id);
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .single();

    if (!profileError && profileData) {
      setDeveloper(profileData);
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!projectsError && projectsData) {
      setProjects(projectsData);
    }

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", id)
      .eq("status", "accepted");

    setFollowersCount(followers || 0);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", id)
      .eq("status", "accepted");

    setFollowingCount(following || 0);

    if (user && user.id !== id) {
      const { data: followData } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", id)
        .neq("status", "declined")
        .maybeSingle();

      if (followData) {
        setFollow(followData);
      }
    }

    setLoading(false);
  };

  const toggleFollow = async () => {
    setMessage("");

    if (!currentUserId) {
      setMessage("Please login first to follow developers.");
      return;
    }

    if (currentUserId === id) {
      setMessage("You cannot follow yourself.");
      return;
    }

    if (follow) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("id", follow.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      setFollow(null);

      if (follow.status === "accepted") {
        setFollowersCount((prev) => Math.max(prev - 1, 0));
      }

      setMessage("Follow request removed.");
      return;
    }

    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUserId,
        following_id: id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setFollow(data);
    setMessage("Follow request sent. Waiting for approval.");
  };

  const getFollowButtonText = () => {
    if (!follow) return "Follow";
    if (follow.status === "pending") return "Request Sent";
    if (follow.status === "accepted") return "Following";
    return "Follow";
  };

  if (loading) {
    return <main className="public-profile-page">Loading profile...</main>;
  }

  if (!developer) {
    return (
      <main className="public-profile-page">
        <section className="public-profile-card">
          <h1>Developer not found</h1>

          <Link href="/developers" className="back-link">
            Back to Developers
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-profile-page">
      <section className="public-profile-card">
        <Link href="/developers" className="back-link">
          ← Back to Developers
        </Link>

        <div className="public-profile-header">
          {developer.avatar_url ? (
            <img
              src={developer.avatar_url}
              alt={developer.full_name || "Developer"}
              className="public-profile-avatar"
            />
          ) : (
            <div className="public-profile-placeholder">
              {developer.full_name
                ? developer.full_name.charAt(0).toUpperCase()
                : "D"}
            </div>
          )}

          <div>
            <p className="profile-badge">Public Developer Profile</p>

            <h1>{developer.full_name || "Developer"}</h1>

            <p className="public-profile-email">{developer.email}</p>

            <div className="follow-stats">
              <span>
                {followersCount}{" "}
                {followersCount === 1 ? "Follower" : "Followers"}
              </span>

              <span>
                {followingCount} Following
              </span>
            </div>

            {currentUserId !== id && (
              <button className="follow-btn" onClick={toggleFollow}>
                {getFollowButtonText()}
              </button>
            )}

            {message && <p className="follow-message">{message}</p>}
          </div>
        </div>

        <div className="public-profile-info">
          <div>
            <h3>Major</h3>
            <p>{developer.major || "Student Developer"}</p>
          </div>

          <div>
            <h3>University</h3>
            <p>{developer.university || "Developer Community"}</p>
          </div>

          <div className="public-profile-bio">
            <h3>Bio</h3>
            <p>
              {developer.bio ||
                "Passionate about software development and technology."}
            </p>
          </div>
        </div>

        <div className="public-projects-section">
          <h2>Portfolio Projects</h2>

          {projects.length === 0 ? (
            <p className="public-no-projects">
              No projects added by this developer yet.
            </p>
          ) : (
            <div className="public-projects-grid">
              {projects.map((project) => (
                <article className="public-project-card" key={project.id}>
                  <h3>{project.title}</h3>

                  <p>{project.description || "No description added."}</p>

                  <div className="public-project-links">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub
                      </a>
                    )}

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}