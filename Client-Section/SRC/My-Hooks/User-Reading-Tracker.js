import { useEffect } from 'react';
import { sendInteraction } from '../services/api';

/**
 * Custom hook to track user view/read intent and handle modal keyboard shortcuts & scroll lock.
 *
 * @param {string} articleId - Active article ID
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Close modal callback
 * @param {Function} onNavigate - Directional navigation callback (-1 | 1)
 */
export function useReadingTracker(articleId, isOpen, onClose, onNavigate, category) {
  useEffect(() => {
    if (!isOpen || !articleId) return;

    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden';

    // Telemetry: record view interaction on modal open
    sendInteraction(articleId, 'view', 0, category);
    const startTime = Date.now();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNavigate(-1);
      else if (e.key === 'ArrowRight') onNavigate(1);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);

      // Telemetry: record exact time spent reading inside the modal card (dwell duration)
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration >= 2 && document.hasFocus()) {
        sendInteraction(articleId, 'modal_dwell', duration, category);
      }
    };
  }, [isOpen, articleId, onClose, onNavigate, category]);
}
