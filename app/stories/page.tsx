"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Story = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
};

export default function StoriesPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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

    setCurrentUserId(user.id);
    await loadStories();
    setLoading(false);
  };

  const loadStories = async () => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data } = await supabase
      .from("stories")
      .select("*")
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false });

    setStories(data || []);

    const userIds = Array.from(
      new Set((data || []).map((story) => story.user_id))
    );

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      setProfiles(profileData || []);
    } else {
      setProfiles([]);
    }
  };

  const uploadStory = async () => {
    setMessage("");

    if (!selectedFile || !currentUserId) {
      setMessage("Please choose an image or video first.");
      return;
    }

    setUploading(true);

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${currentUserId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(fileName, selectedFile);

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("stories").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("stories").insert({
      user_id: currentUserId,
      media_url: data.publicUrl,
      media_type: selectedFile.type,
    });

    if (insertError) {
      setMessage(insertError.message);
      setUploading(false);
      return;
    }

    setSelectedFile(null);
    setMessage("Story uploaded successfully.");
    await loadStories();

    setUploading(false);
  };

  const deleteStory = async (storyId: string) => {
    const { error } = await supabase.from("stories").delete().eq("id", storyId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadStories();
  };

  const getProfile = (userId: string) => {
    return profiles.find((profile) => profile.id === userId);
  };

  if (loading) {
    return <main className="stories-page">Loading stories...</main>;
  }

  return (
    <main className="stories-page">
      <section className="stories-container">
        <div className="stories-header">
          <p className="stories-badge">Developer Stories</p>
          <h1>Share your day</h1>
          <p>Upload temporary stories that stay visible for 24 hours.</p>
        </div>

        <div className="story-upload-card">
          <label className="story-file-btn">
            Choose Image or Video
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setMessage("");
              }}
            />
          </label>

          {selectedFile && (
            <p className="selected-story-file">
              Selected: {selectedFile.name}
            </p>
          )}

          <button onClick={uploadStory} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Story"}
          </button>
        </div>

        {message && <p className="story-message">{message}</p>}

        <div className="stories-grid">
          {stories.length === 0 ? (
            <p className="empty-stories">No active stories yet.</p>
          ) : (
            stories.map((story) => {
              const profile = getProfile(story.user_id);
              const isVideo = story.media_type?.startsWith("video/");

              return (
                <article className="story-card" key={story.id}>
                  <div className="story-user">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} />
                    ) : (
                      <span>
                        {profile?.full_name
                          ? profile.full_name.charAt(0).toUpperCase()
                          : "D"}
                      </span>
                    )}

                    <div>
                      <h3>{profile?.full_name || "Developer"}</h3>
                      <p>{new Date(story.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {isVideo ? (
                    <video
                      src={story.media_url}
                      controls
                      className="story-media"
                    />
                  ) : (
                    <img
                      src={story.media_url}
                      alt="Story"
                      className="story-media"
                    />
                  )}

                  {story.user_id === currentUserId && (
                    <button
                      className="delete-story-btn"
                      onClick={() => deleteStory(story.id)}
                    >
                      Delete Story
                    </button>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}