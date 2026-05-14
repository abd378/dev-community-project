import Link from "next/link";

export default function TopicsPage() {
  const topics = [
    {
      name: "Web Development",
      slug: "web-development",
    },
    {
      name: "Cyber Security",
      slug: "cyber-security",
    },
    {
      name: "Artificial Intelligence",
      slug: "artificial-intelligence",
    },
    {
      name: "Mobile App Development",
      slug: "mobile-development",
    },
    {
      name: "UI/UX Design",
      slug: "ui-ux-design",
    },
    {
      name: "Cloud Computing",
      slug: "cloud-computing",
    },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Explore Topics</h1>

      <p className="page-description">
        Discover trending programming and technology topics.
      </p>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div key={topic.slug} className="topic-card">
            <h2>{topic.name}</h2>

            <p>
              Learn more about {topic.name} and connect with developers
              interested in this field.
            </p>

            <Link href={`/topics/${topic.slug}`}>
              <button>Explore Topic</button>
            </Link>
          </div>
        ))}
      </div>

      <div className="back-home">
        <Link href="/">
          <button>Back Home</button>
        </Link>
      </div>
    </div>
  );
}