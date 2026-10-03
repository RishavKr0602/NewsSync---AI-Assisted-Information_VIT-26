import {
  saveArticle,
  getSavedArticles,
  unsaveArticle,
} from "../services/savedArticleService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const save = asyncHandler(async (req, res) => {
  const {
    userId = "demo-user",
    articleId,
    title,
    description = "",
    image = "",
    url = "",
    source = "",
    publishedAt = "",
  } = req.body;

  if (!articleId || !title) {
    return res.status(400).json({
      success: false,
      message: "articleId and title are required",
    });
  }

  const article = await saveArticle({
    userId,
    articleId,
    title,
    description,
    image,
    url,
    source,
    publishedAt,
  });

  res.status(201).json({
    success: true,
    article,
  });
});

export const getSaved = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const articles = await getSavedArticles(userId);

  res.json({
    success: true,
    articles,
  });
});

export const removeSaved = asyncHandler(async (req, res) => {
  const { userId, articleId } = req.params;
  const article = await unsaveArticle(userId, articleId);

  if (!article) {
    return res.status(404).json({
      success: false,
      message: "Saved article not found",
    });
  }

  res.json({
    success: true,
    message: "Article removed from saved articles",
  });
});
