"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationBadge() {
  const [count, setCount] = useState(0);
  const oldCount = useRef(0);
  const soundReady = useRef(false);

  const playSound = () => {
    if (!soundReady.current) return;

    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );

    audio.volume = 0.8;
    audio.play().catch(() => {});
  };

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

    const total = (followCount || 0) + (notificationCount || 0);

    if (total > oldCount.current) {
      playSound();
    }

    oldCount.current = total;
    setCount(total);
  };

  useEffect(() => {
    const enableSound = () => {
      soundReady.current = true;
    };

    window.addEventListener("click", enableSound);
    window.addEventListener("touchstart", enableSound);

    loadCount();

    const interval = setInterval(loadCount, 2500);

    window.addEventListener("notifications-updated", loadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", enableSound);
      window.removeEventListener("touchstart", enableSound);
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