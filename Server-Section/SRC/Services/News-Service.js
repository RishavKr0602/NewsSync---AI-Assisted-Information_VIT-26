import { fetchAggregatedCandidates } from "./multiSourceService.js";
import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";

export const getNews = async (category = "top", page = "") => {
  const articles = await fetchAggregatedCandidates({ category, page });
  return { articles };
};

export const searchNews = async (query, page = "") => {
  const resData = await fetchNews({ q: query, page });
  const rawArticles = resData.results || [];
  return { articles: rawArticles.map(mapArticle) };
};

export const getNewsByCountry = async (country, page = "") => {
  const articles = await fetchAggregatedCandidates({ country, page });
  return { articles };
};

export const getNewsByLanguage = async (language, page = "") => {
  const articles = await fetchAggregatedCandidates({ language, page });
  return { articles };
};

export const getNewsByCategory = async (category, page = "") => {
  const articles = await fetchAggregatedCandidates({ category, page });
  return { articles };
};
