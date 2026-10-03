/**
 * Formats Markdown and JSON responses from AI services into sanitized HTML strings.
 *
 * @param {string|object} text - Input text or JSON object from AI service
 * @returns {string} Formatted HTML string
 */
export const formatMarkdown = (text) => {
  if (!text) return '';

  let str = text;

  if (typeof text === 'string' && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.summary && Array.isArray(parsed.summary)) str = parsed.summary.map((s) => `* ${s}`).join('\n');
      else if (parsed.keypoints && Array.isArray(parsed.keypoints)) str = parsed.keypoints.map((k) => `* ${k}`).join('\n');
      else if (parsed.explanation) str = parsed.explanation;
      else if (parsed.sentiment) str = `**Sentiment:** ${parsed.sentiment}\n\n**Reason:** ${parsed.reason || ''}`;
      else if (parsed.answer) str = parsed.answer;
      else if (parsed.brief) str = parsed.brief;
    } catch (e) {
      // Retain original text if JSON parse fails
    }
  }

  let html = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/^\s*[\*\-•]\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\*+\s*$/gim, '')
    .replace(/([a-zA-Z0-9.,!?])\*/g, '$1')
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, '<br>');

  return html.replace(/(<li>.*?<\/li>(?:<br>)?)+/gms, (match) => {
    return `<ul>${match.replace(/<br>/g, '')}</ul>`;
  });
};
