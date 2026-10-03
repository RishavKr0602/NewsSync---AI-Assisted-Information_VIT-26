import {
  createInteraction,
  getUserInteractions,
} from "../services/interactionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recordInteraction = asyncHandler(async (req, res) => {
  const {
    userId = "demo-user",
    articleId,
    event,
    duration = 0,
    category = "general",
  } = req.body;

  if (!articleId || !event) {
    return res.status(400).json({
      success: false,
      message: "articleId and event are required",
    });
  }

  const interaction = await createInteraction({
    userId,
    articleId,
    event,
    duration,
    category,
  });


  res.status(201).json({
    success: true,
    interaction,
  });
});

export const getInteractions = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const interactions = await getUserInteractions(userId);

  res.json({
    success: true,
    interactions,
  });
});
