"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCount(0);
      return;
    }

    const { count: followCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id)
      .eq("status", "pending");

    const { count: notificationCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setCount((followCount || 0) + (notificationCount || 0));
  };

  useEffect(() => {
    loadCount();

    const interval = setInterval(loadCount, 3000);

    window.addEventListener("notifications-updated", loadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", loadCount);
    };
  }, []);

  return (
    <Link href="/notifications" className="notification-link">
      Notifications
      {count > 0 && <span className="notification-badge">{count}</span>}
    </Link>
  );
}