import Link from "next/link";
import NotificationBadge from "@/components/NotificationBadge";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left-section">
        <details className="menu-details">
          <summary className="three-dots-btn">⋮</summary>

          <div className="side-dropdown-menu">
            <Link href="/">Home</Link>
            <Link href="/communities">Communities</Link>
            <Link href="/topics">Topics</Link>
            <Link href="/developers">Developers</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/posts">Posts</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/chat">Chat</Link>
          </div>
        </details>
      </div>

      <Link href="/" className="logo">
        DEVHUB
      </Link>

      <details className="profile-menu">
        <summary className="profile-icon">👤</summary>

        <div className="profile-dropdown">
          <Link href="/stories">Stories</Link>
          <NotificationBadge />
          <Link href="/profile">Profile</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </div>
      </details>
    </nav>
  );
}