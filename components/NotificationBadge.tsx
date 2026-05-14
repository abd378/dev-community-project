"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationBadge() {
  const [count, setCount] = useState(0);
  const previousCount = useRef(0);
  const userInteracted = useRef(false);

  const playNotificationSound = () => {
    if (!userInteracted.current) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.35);
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

    const newCount = (followCount || 0) + (notificationCount || 0);

    if (newCount > previousCount.current) {
      playNotificationSound();
    }

    previousCount.current = newCount;
    setCount(newCount);
  };

  useEffect(() => {
    const enableSound = () => {
      userInteracted.current = true;
    };

    window.addEventListener("click", enableSound);
    window.addEventListener("touchstart", enableSound);

    loadCount();

    const interval = setInterval(loadCount, 3000);

    window.addEventListener("notifications-updated", loadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", loadCount);
      window.removeEventListener("click", enableSound);
      window.removeEventListener("touchstart", enableSound);
    };
  }, []);

  return (
    <Link href="/notifications" className="notification-link">
      Notifications
      {count > 0 && <span className="notification-badge">{count}</span>}
    </Link>
  );
}