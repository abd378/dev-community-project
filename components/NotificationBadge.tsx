"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  const previousCount = useRef(0);
  const soundEnabled = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = async () => {
    if (!soundEnabled.current) return;

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadNotifications = async () => {
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

    const { count: notificationsCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    const total = (followCount || 0) + (notificationsCount || 0);

    if (total > previousCount.current) {
      playSound();
    }

    previousCount.current = total;

    setCount(total);
  };

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    const unlockAudio = async () => {
      soundEnabled.current = true;

      try {
        if (audioRef.current) {
          audioRef.current.volume = 0;
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1;
        }
      } catch (error) {
        console.log(error);
      }
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    loadNotifications();

    const interval = setInterval(loadNotifications, 3000);

    window.addEventListener(
      "notifications-updated",
      loadNotifications
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener("click", unlockAudio);

      window.removeEventListener(
        "touchstart",
        unlockAudio
      );

      window.removeEventListener(
        "notifications-updated",
        loadNotifications
      );
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="instagram-nav-icon"
    >
      🔔

      {count > 0 && (
        <span className="instagram-badge">
          {count}
        </span>
      )}
    </Link>
  );
}