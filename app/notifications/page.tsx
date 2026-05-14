"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type FollowRequest = {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
};

type Notification = {
  id: string;
  user_id: string;
  sender_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  major: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: followData } = await supabase
      .from("follows")
      .select("*")
      .eq("following_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setRequests(followData || []);

    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(notificationsData || []);

    const allIds = [
      ...(followData || []).map((item) => item.follower_id),
      ...(notificationsData || []).map((item) => item.sender_id),
    ];

    if (allIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, major")
        .in("id", allIds);

      setProfiles(profileData || []);
    } else {
      setProfiles([]);
    }

    setLoading(false);
  };

  const getProfile = (id: string) => {
    return profiles.find((profile) => profile.id === id);
  };

  const acceptRequest = async (requestId: string) => {
    setMessage("");

    const request = requests.find((item) => item.id === requestId);

    const { error } = await supabase
      .from("follows")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (request) {
      await supabase.from("notifications").insert({
        user_id: request.follower_id,
        sender_id: request.following_id,
        type: "follow_accept",
        content: "accepted your follow request.",
        is_read: false,
      });
    }

    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    setMessage("Follow request accepted successfully.");
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const declineRequest = async (requestId: string) => {
    setMessage("");

    const { error } = await supabase
      .from("follows")
      .update({ status: "declined" })
      .eq("id", requestId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    setMessage("Follow request declined.");
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase.from("notifications").delete().eq("id", notificationId);

    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );

    window.dispatchEvent(new Event("notifications-updated"));
  };

  if (loading) {
    return <main className="notifications-page">Loading...</main>;
  }

  return (
    <main className="notifications-page">
      <section className="notifications-card">
        <div className="notifications-header">
          <p className="notifications-badge">Notifications</p>
          <h1>Your Notifications</h1>
          <p>Follow requests, messages, likes, comments, and community activity.</p>
        </div>

        {message && <p className="notification-message">{message}</p>}

        {requests.length > 0 && (
          <>
            <h2 className="notification-section-title">Follow Requests</h2>

            <div className="requests-list">
              {requests.map((request) => {
                const profile = getProfile(request.follower_id);

                return (
                  <article className="request-item" key={request.id}>
                    <div className="request-user">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || "Student"}
                        />
                      ) : (
                        <div className="request-avatar-placeholder">
                          {profile?.full_name
                            ? profile.full_name.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}

                      <div>
                        <h3>{profile?.full_name || "Student"}</h3>
                        <p>{profile?.major || "Developer"}</p>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        type="button"
                        onClick={() => acceptRequest(request.id)}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="decline-btn"
                        onClick={() => declineRequest(request.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <h2 className="notification-section-title">Recent Activity</h2>

        {notifications.length === 0 ? (
          <p className="empty-requests">No notifications yet.</p>
        ) : (
          <div className="requests-list">
            {notifications.map((notification) => {
              const sender = getProfile(notification.sender_id);

              return (
                <article className="request-item" key={notification.id}>
                  <div className="request-user">
                    {sender?.avatar_url ? (
                      <img
                        src={sender.avatar_url}
                        alt={sender.full_name || "Developer"}
                      />
                    ) : (
                      <div className="request-avatar-placeholder">
                        {sender?.full_name
                          ? sender.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}

                    <div>
                      <h3>{sender?.full_name || "Developer"}</h3>
                      <p>{notification.content}</p>
                    </div>
                  </div>

                  <div className="request-actions">
                    {notification.type === "message" ? (
                      <Link
                        href={`/chat/${notification.sender_id}`}
                        className="open-chat-btn"
                      >
                        Open
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="decline-btn"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}