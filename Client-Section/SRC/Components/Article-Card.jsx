import React, { useState, useEffect, useRef } from 'react';
import {
    getArticleId,
    sendInteraction
} from '../services/api';

export default function ArticleCard({
    article,
    index,
    isSaved,
    onSaveToggle,
    currentView,
    onOpenModal
}) {
    const cardRef = useRef(null);
    const articleId = getArticleId(article);

    const [isLiked, setIsLiked] = useState(false);
    const [imgError, setImgError] = useState(false);

    const [isDisliked, setIsDisliked] = useState(false);

    const hasValidImage =
        article.image &&
        typeof article.image === 'string' &&
        article.image.trim() !== '' &&
        !article.image.includes('placehold.co') &&
        !article.image.includes('placeholder') &&
        !imgError;

    const handleLike = (e) => {
        e.stopPropagation();
        setIsLiked(true);
        setIsDisliked(false);
        sendInteraction(articleId, 'like', 0, article.category);
    };

    const handleDislike = (e) => {
        e.stopPropagation();
        setIsDisliked(true);
        setIsLiked(false);
        sendInteraction(articleId, 'dislike', 0, article.category);
    };

    const handleSave = (e) => {

        e.stopPropagation();
        onSaveToggle(article);
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        sendInteraction(articleId, 'share', 0, article.category);

        if (navigator.share && article.url) {
            try {
                await navigator.share({
                    title: article.title,
                    url: article.url
                });
            } catch (err) {}
        } else if (article.url) {
            try {
                await navigator.clipboard.writeText(article.url);
                alert('Link copied to clipboard.');
            } catch (err) {}
        }
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button, a')) return;
        sendInteraction(articleId, 'view', 0, article.category);
        if (onOpenModal) onOpenModal(index);
    };

    const handleReadLinkClick = (e) => {
        e.stopPropagation();
        sendInteraction(articleId, 'read', 0, article.category);
    };


    return (
        <div
            ref={cardRef}
            className={`card ${!hasValidImage ? 'no-image' : ''}`}
            data-article-id={articleId}
            onClick={handleCardClick}
        >
            {hasValidImage && (
                <div className="card-img-wrapper">
                    <img
                        src={article.image}
                        alt="news"
                        onError={() => setImgError(true)}
                    />
                </div>
            )}

            <div className="card-content">
                <div className="meta">
                    <span>{article.source || ''}</span>
                    <span>{article.publishedAt || ''}</span>
                </div>

                <h2>{article.title}</h2>

                {article.aiReason && (
                    <div className="xai-box">
                        <strong>Why For You</strong>
                        {article.aiReason}
                    </div>
                )}

                <p>{article.description || 'No description available.'}</p>

                {article.url && (
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="readLink"
                        onClick={handleReadLinkClick}
                    >
                        Read Full Article
                    </a>
                )}

                <div className="buttons">
                    <button
                        className={`likeBtn ${isLiked ? 'active' : ''}`}
                        onClick={handleLike}
                    >
                        {isLiked ? 'Liked' : 'Like'}
                    </button>

                    <button
                        className={`dislikeBtn ${isDisliked ? 'active' : ''}`}
                        onClick={handleDislike}
                    >
                        {isDisliked ? 'Disliked' : 'Dislike'}
                    </button>


                    <button
                        className={`saveBtn ${isSaved ? 'active' : ''}`}
                        onClick={handleSave}
                    >
                        {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button className="shareBtn" onClick={handleShare}>
                        Share
                    </button>
                </div>

                {currentView === 'forYou' && article.category && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.45)',
                        textTransform: 'capitalize',
                        letterSpacing: '0.04em',
                        fontWeight: '500'
                    }}>
                        Category: {article.category}
                    </div>
                )}
            </div>
        </div>

    );
}
