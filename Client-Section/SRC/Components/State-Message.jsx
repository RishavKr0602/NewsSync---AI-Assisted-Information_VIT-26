import React from 'react';

export default function StateMessage({ message, isError, onRetry }) {
    if (!message) return null;

    return (
        <div className={`state-message ${isError ? 'error' : ''}`}>
            <p dangerouslySetInnerHTML={{ __html: message }} />
            {onRetry && (
                <button className="retry-btn" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
