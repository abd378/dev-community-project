import Link from "next/link";
import JoinButton from "@/components/JoinButton";

export default function UIUXPage() {
  return (
    <div className="page-container">
      <div className="details-card">
        <div className="details-icon">🎨</div>

        <h1>UI UX Design Community</h1>

        <p>
          Learn modern user interface design, user experience principles,
          wireframing, prototyping, and creative design systems.
        </p>

        <div className="details-info">
          <span>670 Members</span>
          <span>Creative Design</span>
          <span>Figma & Prototyping</span>
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