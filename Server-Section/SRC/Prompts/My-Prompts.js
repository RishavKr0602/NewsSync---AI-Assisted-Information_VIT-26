export const summaryPrompt = (text) => `
You are an expert news analyst.

Provide a concise, well-structured summary of the following news article using clear bullet points. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const explainPrompt = (text) => `
Explain this news article to someone with no technical background in clear, simple language. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const keypointsPrompt = (text) => `
Extract the key take-aways from this news article as concise bullet points. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const sentimentPrompt = (text) => `
Analyze the tone and sentiment of this news article.

Format your output as:
Sentiment: [Positive / Negative / Neutral]
Reasoning: [1-2 sentences explaining why]

Do NOT return JSON or code blocks.

Article:

${text}
`;

export const chatPrompt = (text, question) => `
Answer the question using ONLY the information inside the article. Be direct and clear. Do NOT return JSON or code blocks.

Article:

${text}

Question:

${question}
`;

export const dailyBriefPrompt = (articles) => {
    const text = Array.isArray(articles)
        ? articles
            .map(
                (a, i) =>
                    `${i + 1}. Title: ${a.title || "Untitled"}\nDescription: ${a.description || "No description available"
                    }`
            )
            .join("\n\n")
        : articles || "No articles provided.";

    return `
Summarize today's news articles into a clean executive daily brief with clear bullet points. Highlight key trends and major stories. Do NOT return JSON or code blocks.

Articles:

${text}
`;
};

export const recommendationRerankPrompt = (userInteractions, candidateArticles) => {
    const interactionsText = userInteractions.length > 0
        ? userInteractions.map((art, i) => `${i + 1}. Title: ${art.title || "Untitled"}, Category: ${art.category || ""}`).join("\n")
        : "No recent interactions. General high-quality news preferences.";

    const candidatesText = candidateArticles.map((art, i) => `[Index ${i}] Title: ${art.title || "Untitled"}\nDescription: ${art.description || ""}`).join("\n\n");

    return `
You are a Real-Time Explainable AI (XAI) Recommendation Reranker.

User's Recent Interaction History:
${interactionsText}

Candidate News Articles Pool:
${candidatesText}

Instructions:
Evaluate each candidate article against the User's Interaction History.
Return a RAW JSON array of objects with fields "index" (integer), "score" (integer 0-100), and "reason" (1 concise sentence starting with "Recommended because...").
Do NOT include markdown formatting, backticks, or extra text.

Example JSON output:
[
  {"index": 0, "score": 92, "reason": "Recommended because you saved articles on technology developments."}
]
`;
};
