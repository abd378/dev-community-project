"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setEmail(data.email || user.email || "");
      setUniversity(data.university || "");
      setMajor(data.major || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
    }

    setLoading(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage("");

      const file = e.target.files?.[0];

      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setAvatarUrl(publicUrl);
      setMessage("Profile image uploaded successfully.");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        university,
        major,
        bio,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }
  };

  if (loading) {
    return <main className="profile-page">Loading profile...</main>;
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-box">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {fullName ? fullName.charAt(0).toUpperCase() : "S"}
              </div>
            )}
          </div>

          <div>
            <p className="profile-badge">Student Profile</p>
            <h1>Manage your profile</h1>
            <p>{email}</p>

            <label className="avatar-upload-btn">
              {uploading ? "Uploading..." : "Upload Profile Image"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                hidden
              />
            </label>
          </div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />

          <label>University</label>
          <input
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Your university"
          />

          <label>Major</label>
          <input
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="Computer Science"
          />

          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
          />

          <button type="submit">Save Profile</button>
        </form>

        {message && <p className="profile-message">{message}</p>}
      </section>
    </main>
  );
}