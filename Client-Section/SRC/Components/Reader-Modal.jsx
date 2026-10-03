import React, { useState, useEffect } from 'react';
import {
  getArticleId,
  sendInteraction,
  aiSummarize,
  aiExplain,
  aiKeypoints,
  aiSentiment,
  aiChat
} from '../services/api';
import { useReadingTracker } from '../hooks/useReadingTracker';
import ReaderActions from './ReaderModal/ReaderActions';
import ReaderUpNextCard from './ReaderModal/ReaderUpNextCard';
import ReaderAISection from './ReaderModal/ReaderAISection';

export default function ReaderModal({
  article,
  nextArticle,
  index,
  total,
  isOpen,
  onClose,
  onNavigate,
  isSaved,
  onSaveToggle,
  onLoadMore,
  isLoadingMore
}) {
  const [aiOutput, setAiOutput] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [imgError, setImgError] = useState(false);

  const articleId = getArticleId(article);

  // Reading Telemetry & Body Scroll Lock Custom Hook
  useReadingTracker(articleId, isOpen, onClose, onNavigate, article?.category);

  // Reset internal state when article changes
  useEffect(() => {
    setAiOutput(null);
    setIsLoadingAI(false);
    setIsLiked(false);
    setIsDisliked(false);
    setIsChatOpen(false);
    setQuestion('');
    setImgError(false);
  }, [articleId]);

  if (!isOpen || !article) return null;

  const articleText = `Title:\n${article.title || ''}\n\nDescription:\n${article.description || ''}\n\nContent:\n${article.content || ''}`;

  const handleAIAction = async (actionFn, interactionEvent) => {
    try {
      setIsLoadingAI(true);
      setAiOutput('Analyzing story with AI...');
      const result = await actionFn(articleText);
      setAiOutput(result);
      if (interactionEvent) sendInteraction(articleId, interactionEvent, 0, article?.category);
    } catch (err) {
      setAiOutput(`**Error:** ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setIsLoadingAI(true);
      setAiOutput('Thinking...');
      const answer = await aiChat(articleText, question);
      setAiOutput(answer);
      sendInteraction(articleId, 'ai_chat', 0, article?.category);
      setQuestion('');
    } catch (err) {
      setAiOutput(`**Error:** ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleLike = () => {
    setIsLiked(true);
    setIsDisliked(false);
    sendInteraction(articleId, 'like', 0, article?.category);
  };

  const handleDislike = () => {
    setIsDisliked(true);
    setIsLiked(false);
    sendInteraction(articleId, 'dislike', 0, article?.category);
  };



  const handleShare = async () => {
    sendInteraction(articleId, 'share', 0, article?.category);

    if (navigator.share && article.url) {
      try {
        await navigator.share({ title: article.title, url: article.url });
      } catch (err) {}
    } else if (article.url) {
      try {
        await navigator.clipboard.writeText(article.url);
        alert('Link copied to clipboard.');
      } catch (err) {}
    }
  };

  const renderStoryParagraphs = () => {
    const isPaywallText = (str) =>
      typeof str === 'string' &&
      (str.includes("ONLY AVAILABLE IN PAID PLANS") ||
       str.includes("ONLY AVAILABLE IN PAID PLAN") ||
       str.toLowerCase().includes("paid plan"));

    let fullText = article.description || article.content || '';
    if (isPaywallText(fullText)) {
      fullText = article.description && !isPaywallText(article.description)
        ? article.description
        : '';
    }

    if (!fullText || isPaywallText(fullText)) {
      return <p className="reader-paragraph">Select Summarize, Explain, or Key Points on the right to view instant grounded AI insights on this story.</p>;
    }

    const paragraphs = fullText
      .split(/\n\n+|\r\n\r\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !isPaywallText(p));

    if (paragraphs.length > 1) {
      return paragraphs.map((para, i) => (
        <p key={i} className="reader-paragraph">{para}</p>
      ));
    }

    if (fullText.length > 220) {
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      const chunks = [];
      let currentChunk = '';
      sentences.forEach((s) => {
        currentChunk += ' ' + s.trim();
        if (currentChunk.length >= 200) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      });
      if (currentChunk.trim()) chunks.push(currentChunk.trim());

      if (chunks.length > 1) {
        return chunks.map((chunk, i) => (
          <p key={i} className="reader-paragraph">{chunk}</p>
        ));
      }
    }

    return <p className="reader-paragraph">{fullText}</p>;
  };

  const hasValidImage =
    article &&
    article.image &&
    typeof article.image === 'string' &&
    article.image.trim() !== '' &&
    !article.image.includes('placehold.co') &&
    !article.image.includes('placeholder') &&
    !imgError;

  return (
    <div
      className="reader-modal-overlay"
      onClick={(e) => e.target.classList.contains('reader-modal-overlay') && onClose()}
    >
      <button
        className="reader-nav-btn prev-btn"
        onClick={() => onNavigate(-1)}
        title="Previous Story (Left Arrow)"
        aria-label="Previous Story"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        className="reader-nav-btn next-btn"
        onClick={() => onNavigate(1)}
        title="Next Story (Right Arrow)"
        aria-label="Next Story"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className="reader-modal-card">
        <button
          className="reader-close-btn"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close modal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 1L13 13M13 1L1 13" />
          </svg>
        </button>

        <div className="reader-modal-body">
          <div className="reader-layout">
            {/* Left Panel: Article Detail & Action Controls */}
            <div className="reader-left-panel">
              <div className="reader-header">
                <span className="reader-nav-indicator">
                  Story {index + 1} of {total}
                </span>
                {typeof article.score === 'number' && (
                  <span className="match-badge">{article.score}% Match</span>
                )}
              </div>

              <div className="meta">
                <span>{article.source || ''}</span>
                <span>{article.publishedAt || ''}</span>
              </div>

              <h1 className="reader-title">{article.title}</h1>

              {article.aiReason && (
                <div className="xai-box">
                  <strong>Why For You</strong>
                  {article.aiReason}
                </div>
              )}

              {hasValidImage && (
                <div className="reader-img-wrapper">
                  <img src={article.image} alt={article.title || 'Story Image'} onError={() => setImgError(true)} />
                </div>
              )}

              <div className="reader-body-text">
                {renderStoryParagraphs()}
              </div>

              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="readLink reader-full-link"
                  onClick={() => sendInteraction(articleId, 'read', 0, article?.category)}

                >
                  Read Full Article on Source

                </a>
              )}

              <ReaderActions
                isLoadingAI={isLoadingAI}
                isLiked={isLiked}
                isDisliked={isDisliked}
                isSaved={isSaved}
                isChatOpen={isChatOpen}
                onSummarize={() => handleAIAction((t) => aiSummarize(t), 'ai_summary')}
                onExplain={() => handleAIAction((t) => aiExplain(t))}
                onKeypoints={() => handleAIAction((t) => aiKeypoints(t))}
                onSentiment={() => handleAIAction((t) => aiSentiment(t))}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onLike={handleLike}
                onDislike={handleDislike}
                onSaveToggle={onSaveToggle}
                onShare={handleShare}
                article={article}
              />


              <form className={`chat-box reader-chat-drawer ${isChatOpen ? 'open' : ''}`} onSubmit={handleChatSubmit}>
                <input
                  className="questionInput"
                  placeholder="Ask anything about this story..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button type="submit" className="chatBtn" disabled={isLoadingAI}>
                  Ask AI
                </button>
              </form>

              {/* Up Next Section */}
              <ReaderUpNextCard
                nextArticle={nextArticle}
                onNavigate={onNavigate}
                onLoadMore={onLoadMore}
                isLoadingMore={isLoadingMore}
              />

              <div className="reader-scroll-spacer" style={{ height: '48px', flexShrink: 0 }} />
            </div>

            {/* Right Panel: AI Intelligence Assistant */}
            <ReaderAISection aiOutput={aiOutput} />
          </div>
        </div>
      </div>
    </div>
  );
}
