import Link from "next/link";
import NotificationBadge from "@/components/NotificationBadge";

export default function Navbar() {
  return (
    <nav className="bottom-navbar">
      <Link href="/" className="bottom-nav-item">🏠</Link>
      <Link href="/developers" className="bottom-nav-item">👥</Link>
      <Link href="/posts" className="bottom-nav-item">➕</Link>
      <Link href="/chat" className="bottom-nav-item">💬</Link>
      <NotificationBadge />
      <Link href="/profile" className="bottom-nav-item">👤</Link>
    </nav>
  );
}