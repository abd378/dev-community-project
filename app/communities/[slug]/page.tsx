import { communities } from "@/data/communities";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CommunityDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const community = communities.find(
    (item) => item.slug === slug
  );

  if (!community) {
    notFound();
  }

  return (
    <div className="page-container">
      <div className="details-card">
        <div className="details-icon">🚀</div>

        <h1>{community.name}</h1>

        <p>{community.description}</p>

        <div className="details-info">
          <span>{community.members}+ Members</span>
          <span>Active Community</span>
          <span>Next.js Platform</span>
        </div>

        <p>
          This community helps developers learn modern technologies,
          improve programming skills, and connect with other developers.
        </p>

        <Link href="/communities">
          <button className="secondary-btn">
            Back to Communities
          </button>
        </Link>
      </div>
    </div>
  );
}