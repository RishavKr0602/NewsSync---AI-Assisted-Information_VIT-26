const BASE_URL = '/api';
export const USER_ID = 'demo-user';

/**
 * Fetch latest news articles with optional filters
 */
export async function fetchNews({ search = '', category = '', country = '', language = '' } = {}) {
    let url = `${BASE_URL}/news`;

    if (search) {
        url = `${BASE_URL}/news/search?q=${encodeURIComponent(search)}`;
    } else if (category) {
        url = `${BASE_URL}/news/category/${encodeURIComponent(category)}`;
    } else if (country) {
        url = `${BASE_URL}/news/country/${encodeURIComponent(country)}`;
    } else if (language) {
        url = `${BASE_URL}/news/language/${encodeURIComponent(language)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    const data = await res.json();
    return data.articles || [];
}

/**
 * Fetch personalized recommendations for user
 */
export async function fetchRecommendations() {
    const res = await fetch(`${BASE_URL}/recommendations/${USER_ID}`);
    if (!res.ok) throw new Error(`Server status ${res.status}`);
    const data = await res.json();
    return data.articles || data.recommendations || [];
}

/**
 * Fetch saved articles for user
 */
export async function fetchSavedArticles() {
    const res = await fetch(`${BASE_URL}/saved/${USER_ID}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
}

/**
 * Save an article to database
 */
export async function saveArticle(article) {
    const articleId = getArticleId(article);
    if (!articleId) return;

    await fetch(`${BASE_URL}/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: USER_ID,
            articleId,
            title: article.title || 'Untitled',
            description: article.description || '',
            image: article.image || '',
            url: article.url || '',
            source: article.source || '',
            publishedAt: article.publishedAt || ''
        })
    });
}

/**
 * Remove an article from saved list
 */
export async function removeSavedArticle(articleId) {
    if (!articleId) return;
    await fetch(`${BASE_URL}/saved/${USER_ID}/${encodeURIComponent(articleId)}`, {
        method: 'DELETE'
    });
}

/**
 * Log user interaction event (view, read, save, like, share, click, ai_summary, etc.)
 */
export async function sendInteraction(articleId, event, duration, category) {
    if (!articleId) return;
    const body = { userId: USER_ID, articleId, event };
    if (typeof duration === 'number') body.duration = duration;
    if (category) body.category = category;

    try {
        await fetch(`${BASE_URL}/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.warn('Interaction logging warning:', err);
    }
}


/**
 * AI Action Endpoints
 */
export async function aiSummarize(text) {
    const res = await fetch(`${BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.summary;
}

export async function aiExplain(text) {
    const res = await fetch(`${BASE_URL}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.explanation;
}

export async function aiKeypoints(text) {
    const res = await fetch(`${BASE_URL}/ai/keypoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.keypoints;
}

export async function aiSentiment(text) {
    const res = await fetch(`${BASE_URL}/ai/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.sentiment;
}

export async function aiChat(text, question) {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question })
    });
    const data = await res.json();
    return data.answer;
}

export async function aiDailyBrief(articles) {
    const res = await fetch(`${BASE_URL}/ai/daily-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles })
    });
    const data = await res.json();
    return data.brief;
}

/**
 * Helper to extract unique Article ID
 */
export function getArticleId(article) {
    if (!article) return null;
    return article.articleId || article.id || article._id || article.url || article.title || null;
}
