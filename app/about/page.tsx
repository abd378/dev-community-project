export default function AboutPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">About DevConnect</h1>

      <p className="page-description">
        DevConnect is a modern developer community platform built with Next.js.
        It helps developers discover communities, explore topics, and connect
        with other programmers.
      </p>

      <div className="developer-grid">
        <div className="developer-card">
          <h2>Project Goal</h2>
          <p>
            The goal of this project is to practice routing, layouts, nested
            routes, dynamic routes, and components using the App Router.
          </p>
        </div>

        <div className="developer-card">
          <h2>Technologies</h2>
          <p>
            This project uses Next.js, TypeScript, React Components, Client
            Components, Server Components, and CSS styling.
          </p>
        </div>

        <div className="developer-card">
          <h2>Student Work</h2>
          <p>
            This platform is designed as a clean frontend structure for a
            developer community website.
          </p>
        </div>
      </div>
    </div>
  );
}