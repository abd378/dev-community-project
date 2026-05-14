import Link from "next/link";
import JoinButton from "@/components/JoinButton";

export default function MobileDevelopmentPage() {
  return (
    <div className="page-container">
      <div className="details-card">
        <div className="details-icon">📱</div>

        <h1>Mobile Development Community</h1>

        <p>
          This community is for developers who want to build Android and iOS
          applications using Flutter, React Native, and modern mobile tools.
        </p>

        <div className="details-info">
          <span>850 Members</span>
          <span>Mobile Apps</span>
          <span>Beginner Friendly</span>
        </div>

        <JoinButton />

        <br />
        <br />

        <Link href="/communities">
          <button className="secondary-btn">Back to Communities</button>
        </Link>
      </div>
    </div>
  );
}