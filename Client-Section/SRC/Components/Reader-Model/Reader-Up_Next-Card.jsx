import React from 'react';

export default function ReaderUpNextCard({
  nextArticle,
  onNavigate,
  onLoadMore,
  isLoadingMore
}) {
  return (
    <div className="up-next-container">
      <div className="up-next-divider" />
      <span className="up-next-badge">UP NEXT IN STORIES</span>

      {nextArticle ? (
        <div className="up-next-card" onClick={() => onNavigate(1)}>
          <div className="up-next-content">
            <span className="up-next-source">{nextArticle.source || 'News'}</span>
            <h4 className="up-next-title">{nextArticle.title}</h4>
          </div>
          <button className="up-next-nav-btn">
            Next Story →
          </button>
        </div>
      ) : (
        <div className="up-next-card load-more-card">
          <div className="up-next-content">
            <h4 className="up-next-title">You've reached the end of this batch</h4>
            <p className="up-next-subtext">Click below to fetch more live stories seamlessly</p>
          </div>
          <button className="up-next-load-btn" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? 'Loading Stories...' : 'Load More Articles'}
          </button>
        </div>
      )}
    </div>
  );
}
