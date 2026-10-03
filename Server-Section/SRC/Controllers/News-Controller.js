import * as newsService from "../services/newsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNews = asyncHandler(async (req, res) => {
  const category = req.query.category || "";
  const page = req.query.page || "";
  const result = await newsService.getNews(category, page);

  res.json({
    success: true,
    articles: result.articles,
    nextPage: result.nextPage,
  });
});

export const searchNews = asyncHandler(async (req, res) => {
  const { q, page } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const result = await newsService.searchNews(q, page || "");

  res.json({
    success: true,
    articles: result.articles,
    nextPage: result.nextPage,
  });
});

export const getCategoryNews = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page = req.query.page || "";
  const result = await newsService.getNewsByCategory(category, page);

  res.json({
    success: true,
    articles: result.articles,
    nextPage: result.nextPage,
  });
});

export const getCountryNews = asyncHandler(async (req, res) => {
  const { country } = req.params;
  const page = req.query.page || "";
  const result = await newsService.getNewsByCountry(country, page);

  res.json({
    success: true,
    articles: result.articles,
    nextPage: result.nextPage,
  });
});

export const getLanguageNews = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const page = req.query.page || "";
  const result = await newsService.getNewsByLanguage(language, page);

  res.json({
    success: true,
    articles: result.articles,
    nextPage: result.nextPage,
  });
});
