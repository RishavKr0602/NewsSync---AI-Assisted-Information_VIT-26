import { getPersonalizedRecommendations } from "../services/recommendationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.params.userId || "anonymous_user";
  const articles = await getPersonalizedRecommendations(userId);

  res.json({
    success: true,
    articles,
  });
});
