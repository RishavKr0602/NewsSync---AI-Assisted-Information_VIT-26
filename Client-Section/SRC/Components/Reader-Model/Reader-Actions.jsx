import React from 'react';

export default function ReaderActions({
  isLoadingAI,
  isLiked,
  isDisliked,
  isSaved,
  isChatOpen,
  onSummarize,
  onExplain,
  onKeypoints,
  onSentiment,
  onToggleChat,
  onLike,
  onDislike,
  onSaveToggle,
  onShare,
  article
}) {
  return (
    <div className="buttons reader-actions">
      <button onClick={onSummarize} disabled={isLoadingAI}>
        Summarize
      </button>
      <button onClick={onExplain} disabled={isLoadingAI}>
        Explain
      </button>
      <button onClick={onKeypoints} disabled={isLoadingAI}>
        Key Points
      </button>
      <button onClick={onSentiment} disabled={isLoadingAI}>
        Sentiment
      </button>
      <button className="askBtn" onClick={onToggleChat}>
        Ask AI
      </button>
      <button className={`likeBtn ${isLiked ? 'active' : ''}`} onClick={onLike}>
        {isLiked ? 'Liked' : 'Like'}
      </button>
      <button className={`dislikeBtn ${isDisliked ? 'active' : ''}`} onClick={onDislike}>
        {isDisliked ? 'Disliked' : 'Dislike'}
      </button>

      <button className={`saveBtn ${isSaved ? 'active' : ''}`} onClick={() => onSaveToggle(article)}>
        {isSaved ? 'Saved' : 'Save'}
      </button>
      <button className="shareBtn" onClick={onShare}>
        Share
      </button>
    </div>

  );
}
