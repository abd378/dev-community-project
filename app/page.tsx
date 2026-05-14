import Link from "next/link";

export default function HomePage() {
  return (
    <main className="medal-home">
      <section className="medal-hero">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>

        <div className="hero-content">
          <div className="hero-badge">Next.js Developer Platform</div>

          <h1>
            Build. Connect. <br />
            Grow With Developers.
          </h1>

          <p>
            A modern developer community where you can explore communities,
            discover topics, meet developers, and share your profile.
          </p>

          <div className="hero-buttons">
            <Link href="/communities">
              <button className="primary-btn">Explore Communities</button>
            </Link>

            <Link href="/developers">
              <button className="secondary-btn">Meet Developers</button>
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-top">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <h2>Dev Community</h2>
          <p>Join communities, learn topics, and connect with skilled developers.</p>

          <div className="mini-grid">
            <div>React</div>
            <div>Next.js</div>
            <div>UI/UX</div>
            <div>AI</div>
          </div>
        </div>
      </section>

      <section className="medal-stats">
        <div>
          <h2>3+</h2>
          <p>Communities</p>
        </div>

        <div>
          <h2>5+</h2>
          <p>Developers</p>
        </div>

        <div>
          <h2>6+</h2>
          <p>Topics</p>
        </div>
      </section>

      <section className="feature-section">
        <h2>Everything Developers Need</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Explore Communities</h3>
            <p>Find groups based on your interests and programming fields.</p>
          </div>

          <div className="feature-card">
            <h3>Meet Developers</h3>
            <p>View developer profiles, skills, roles, and projects.</p>
          </div>

          <div className="feature-card">
            <h3>Discover Topics</h3>
            <p>Learn about web development, AI, cybersecurity, UI/UX, and more.</p>
          </div>
        </div>
      </section>
    </main>
  );
}