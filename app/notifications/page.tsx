"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Notification = {
  id: string;
  user_id: string;
  sender_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    window.dispatchEvent(new Event("notifications-updated"));

    setLoading(false);
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
            <p>All your alerts stay here until you delete them.</p>
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

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="empty-notifications">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div className="notification-item" key={notification.id}>
                <div>
                  <h3>
                    {notification.type === "message"
                      ? "New Message"
                      : notification.type === "follow"
                      ? "Follow Request"
                      : "Notification"}
                  </h3>

                  <p>{notification.content}</p>

                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>

                <button
                  className="delete-notification-btn"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}