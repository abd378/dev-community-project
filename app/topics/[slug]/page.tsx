import Link from "next/link";

export default async function TopicDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

      <p className="page-description">
        Welcome to the {title} topic page. Here you can explore resources,
        tutorials, developers, and communities related to this field.
      </p>

      <div className="topic-card">
        <h2>About {title}</h2>
        <p>
          This topic helps developers learn important skills, discover useful
          content, and connect with people who are interested in the same area.
        </p>
      </div>

      <br />

      <Link href="/topics">
        <button>Back to Topics</button>
      </Link>
    </div>
  );
}