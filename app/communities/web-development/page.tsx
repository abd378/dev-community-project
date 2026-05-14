import Link from "next/link";
import JoinButton from "@/components/JoinButton";

export default function WebDevelopmentPage() {
  return (
    <div className="page-container">
      <div className="details-card">
        <div className="details-icon">🌐</div>

        <h1>Web Development Community</h1>

        <p>
          This community focuses on frontend and backend development using
          React, Next.js, Node.js, APIs, and databases.
        </p>

        <div className="details-info">
          <span>1,240 Members</span>
          <span>Frontend & Backend</span>
          <span>Projects & Tutorials</span>
        </div>

        <JoinButton />

        <br />
        <br />

        <Link href="/communities">
          <button className="secondary-btn">
            Back to Communities
          </button>
        </Link>
      </div>
    </div>
  );
}