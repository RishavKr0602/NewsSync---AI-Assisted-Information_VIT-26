import React from 'react';
import { formatMarkdown } from '../../utils/markdownFormatter';

export default function ReaderAISection({ aiOutput }) {
  return (
    <div className="reader-right-panel">
      <div className="reader-ai-panel-head">
        <div className="reader-ai-title-row">
          <h3>AI Assistant</h3>
        </div>
        <span className="reader-ai-subtitle">Select an analysis tool on the left or ask a question</span>
      </div>

      <div className="reader-ai-output">
        {aiOutput ? (
          <div
            className="ai-output-formatted"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(aiOutput) }}
          />
        ) : (
          <p className="reader-ai-placeholder">
            Select <strong>Summarize</strong>, <strong>Explain</strong>, <strong>Key Points</strong>, or <strong>Ask AI</strong> to view interactive grounded insights on this story.
          </p>
        )}
      </div>
    </div>
  );
}
