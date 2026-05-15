"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationBadge() {
  const [count, setCount] = useState(0);
  const oldCount = useRef(0);
  const soundAllowed = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!soundAllowed.current || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
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
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.8;

    const allowSound = () => {
      soundAllowed.current = true;
    };

    window.addEventListener("click", allowSound);
    window.addEventListener("touchstart", allowSound);

    loadCount();

    const interval = setInterval(loadCount, 2500);

    window.addEventListener("notifications-updated", loadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", allowSound);
      window.removeEventListener("touchstart", allowSound);
      window.removeEventListener("notifications-updated", loadCount);
    };
  }, []);

  return (
    <Link href="/notifications" className="instagram-nav-icon">
      🔔
      {count > 0 && <span className="instagram-badge">{count}</span>}
    </Link>
  );
}