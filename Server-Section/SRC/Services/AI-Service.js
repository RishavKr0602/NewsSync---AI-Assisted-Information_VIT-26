import { generateContent } from "../providers/geminiProvider.js";

import {
  summaryPrompt,
  explainPrompt,
  keypointsPrompt,
  sentimentPrompt,
  chatPrompt,
  dailyBriefPrompt,
  recommendationRerankPrompt,
} from "../prompts/prompts.js";

export const summarize = async (text) =>
  generateContent(summaryPrompt(text));

export const explain = async (text) =>
  generateContent(explainPrompt(text));

export const keypoints = async (text) =>
  generateContent(keypointsPrompt(text));

export const sentiment = async (text) =>
  generateContent(sentimentPrompt(text));

export const chat = async (text, question) =>
  generateContent(chatPrompt(text, question));

export const dailyBrief = async (articles) =>
  generateContent(dailyBriefPrompt(articles));

export const rankAndExplainCandidates = async (candidates, userInteractions) => {
  if (!candidates || candidates.length === 0) return [];
  try {
    const prompt = recommendationRerankPrompt(userInteractions, candidates);
    const rawResponse = await generateContent(prompt);

    const cleaned = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluations = JSON.parse(cleaned);
    return Array.isArray(evaluations) ? evaluations : [];
  } catch (err) {
    console.error("rankAndExplainCandidates error:", err.message);
    return candidates.map((_, index) => ({
      index,
      score: 75,
      reason: "Recommended based on overall popular interest."
    }));
  }
};
