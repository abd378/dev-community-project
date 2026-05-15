"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      setLoading(false);
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

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    const allIds = [
      ...(followData || []).map((item) => item.follower_id),
      ...(notificationsData || []).map((item) => item.sender_id),
    ];

    if (allIds.length > 0) {
      const uniqueIds = Array.from(new Set(allIds));

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, major")
        .in("id", uniqueIds);

      setProfiles(profileData || []);
    } else {
      setProfiles([]);
    }

    window.dispatchEvent(new Event("notifications-updated"));
    setLoading(false);
  };

  const getProfile = (id: string) => {
    return profiles.find((profile) => profile.id === id);
  };

  const acceptRequest = async (request: FollowRequest) => {
    setMessage("");

    const { error } = await supabase
      .from("follows")
      .update({ status: "accepted" })
      .eq("id", request.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await supabase.from("notifications").insert({
      user_id: request.follower_id,
      sender_id: request.following_id,
      type: "follow_accept",
      content: "accepted your follow request.",
      is_read: false,
    });

    setRequests((prev) => prev.filter((item) => item.id !== request.id));
    setMessage("Follow request accepted.");
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const declineRequest = async (request: FollowRequest) => {
    setMessage("");

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", request.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequests((prev) => prev.filter((item) => item.id !== request.id));
    setMessage("Follow request declined.");
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);

    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );

    window.dispatchEvent(new Event("notifications-updated"));
  };

  const deleteAllNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  if (loading) {
    return <main className="notifications-page">Loading notifications...</main>;
  }

  return (
    <main className="notifications-page">
      <section className="notifications-card">
        <div className="notifications-header">
          <div>
            <p className="notifications-badge">Notifications</p>
            <h1>Your Notifications</h1>
            <p>Follow requests, messages, likes, comments, and activity.</p>
          </div>

          {notifications.length > 0 && (
            <button
              className="delete-all-notifications"
              onClick={deleteAllNotifications}
            >
              Delete All
            </button>
          )}
        </div>

        {message && <p className="notification-message">{message}</p>}

        <h2 className="notification-section-title">Follow Requests</h2>

        {requests.length === 0 ? (
          <p className="empty-notifications">No follow requests.</p>
        ) : (
          <div className="requests-list">
            {requests.map((request) => {
              const profile = getProfile(request.follower_id);

              return (
                <article className="request-item" key={request.id}>
                  <div className="request-user">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Follower" />
                    ) : (
                      <div className="request-avatar-placeholder">
                        {profile?.full_name
                          ? profile.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}

                    <div>
                      <h3>{profile?.full_name || "Developer"}</h3>
                      <p>{profile?.major || "sent you a follow request."}</p>
                    </div>
                  </div>

                  <div className="request-actions">
                    <button onClick={() => acceptRequest(request)}>
                      Accept
                    </button>

                    <button
                      className="decline-btn"
                      onClick={() => declineRequest(request)}
                    >
                      Decline
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <h2 className="notification-section-title">Recent Activity</h2>

        {notifications.length === 0 ? (
          <p className="empty-notifications">No notifications yet.</p>
        ) : (
          <div className="requests-list">
            {notifications.map((notification) => {
              const sender = getProfile(notification.sender_id);

              return (
                <article className="request-item" key={notification.id}>
                  <div className="request-user">
                    {sender?.avatar_url ? (
                      <img src={sender.avatar_url} alt="Sender" />
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
                      <small>
                        {new Date(notification.created_at).toLocaleString()}
                      </small>
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
                        className="delete-notification-btn"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Delete
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