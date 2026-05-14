import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="page-container">
      <div className="details-card">
        <div className="details-icon">🚫</div>

        <h1>404 - Page Not Found</h1>

        <p>
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link href="/">
          <button>Back to Home</button>
        </Link>
      </div>
    </div>
  );
}