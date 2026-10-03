import * as aiService from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const summarize = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const summary = await aiService.summarize(text);
  res.json({ success: true, summary });
});

export const explain = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const explanation = await aiService.explain(text);
  res.json({ success: true, explanation });
});

export const keypoints = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const keypoints = await aiService.keypoints(text);
  res.json({ success: true, keypoints });
});

export const sentiment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const sentiment = await aiService.sentiment(text);
  res.json({ success: true, sentiment });
});

export const chat = asyncHandler(async (req, res) => {
  const { text, question } = req.body;
  const answer = await aiService.chat(text, question);
  res.json({ success: true, answer });
});

export const dailyBrief = asyncHandler(async (req, res) => {
  const { articles } = req.body;
  const brief = await aiService.dailyBrief(articles);
  res.json({ success: true, brief });
});
