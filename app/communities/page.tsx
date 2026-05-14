import Link from "next/link";
import { communities } from "@/data/communities";

export default function CommunitiesPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">
        Developer Communities
      </h1>

      <p className="page-description">
        Explore professional communities and connect with developers.
      </p>

      <div className="community-container">
        {communities.map((community) => (
          <div
            key={community.slug}
            className="community-card"
          >
            <div className="community-icon">
              🚀
            </div>

            <h2>{community.name}</h2>

            <p>{community.description}</p>

            <div className="details-info">
              <span>
                {community.members}+ Members
              </span>
            </div>

            <Link
              href={`/communities/${community.slug}`}
            >
              <button>
                Explore Community
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}