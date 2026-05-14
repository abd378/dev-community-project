export default function NewMembersPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">New Members</h1>

      <p className="page-description">
        Meet the newest developers who recently joined the platform.
      </p>

      <div className="developer-grid">
        <div className="developer-card">
          <h2>Sara Khaled</h2>
          <p>Joined 2 days ago.</p>
        </div>

        <div className="developer-card">
          <h2>Ali Hamad</h2>
          <p>Joined 1 week ago.</p>
        </div>
      </div>
    </div>
  );
}