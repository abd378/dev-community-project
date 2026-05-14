 export default function TopRatedPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Top Rated Developers</h1>

      <p className="page-description">
        These developers have the highest ratings and contributions in the
        platform community.
      </p>

      <div className="developer-grid">
        <div className="developer-card">
          <h2>Abed Osman</h2>
          <p>Rating: ⭐⭐⭐⭐⭐</p>
        </div>

        <div className="developer-card">
          <h2>Omar Hassan</h2>
          <p>Rating: ⭐⭐⭐⭐⭐</p>
        </div>
      </div>
    </div>
  );
}