"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  github_url: string;
  live_url: string;
  image_url: string;
  created_at: string;
};

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);
    await loadProjects(user.id);
    setLoading(false);
  };

  const loadProjects = async (id: string) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) setProjects(data);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) return;

    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      title,
      description,
      github_url: githubUrl,
      live_url: liveUrl,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setGithubUrl("");
    setLiveUrl("");
    setMessage("Project added successfully.");

    await loadProjects(userId);
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadProjects(userId);
  };

  if (loading) {
    return <main className="projects-page">Loading projects...</main>;
  }

  return (
    <main className="projects-page">
      <section className="projects-container">
        <div className="projects-header">
          <p className="projects-badge">Developer Portfolio</p>
          <h1>Your Projects</h1>
          <p>Add your GitHub projects, live demos, and portfolio work.</p>
        </div>

        <form className="project-form" onSubmit={createProject}>
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="url"
            placeholder="GitHub link"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <input
            type="url"
            placeholder="Live demo link"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
          />

          <button type="submit">Add Project</button>
        </form>

        {message && <p className="project-message">{message}</p>}

        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="empty-projects">No projects added yet.</p>
          ) : (
            projects.map((project) => (
              <article className="project-card" key={project.id}>
                <h2>{project.title}</h2>
                <p>{project.description || "No description added."}</p>

                <div className="project-links">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank">
                      GitHub
                    </a>
                  )}

                  {project.live_url && (
                    <a href={project.live_url} target="_blank">
                      Live Demo
                    </a>
                  )}
                </div>

                <button
                  className="delete-project-btn"
                  onClick={() => deleteProject(project.id)}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}