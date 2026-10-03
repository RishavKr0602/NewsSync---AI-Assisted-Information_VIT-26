import { fetchNews } from "../providers/newsDataProvider.js";
import { fetchRssNews } from "../providers/rssProvider.js";
import { fetchGNews } from "../providers/gnewsProvider.js";
import { fetchNewsApiOrg } from "../providers/newsApiOrgProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";
import { detectCategory } from "../utils/categoryDetector.js";

const normalizeTitle = (title) => {
  if (!title) return "";
  return title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
};

export const fetchAggregatedCandidates = async ({
  category = "top",
  country = "in",
  language = "en",
  page = "",
} = {}) => {
  const providers = [
    // 1. NewsData.io Primary API
    fetchNews({ category, country, language, page })
      .then((res) => res.results || [])
      .catch((err) => {
        console.warn("⚠️ NewsData.io failed in aggregator:", err.message);
        return [];
      }),

    // 2. Free Global RSS Feeds (BBC, Reuters, TechCrunch, NYT, CNBC, Wired)
    fetchRssNews(category).catch((err) => {
      console.warn("⚠️ RSS aggregator failed:", err.message);
      return [];
    }),

    // 3. Optional GNews API (if GNEWS_API_KEY present)
    fetchGNews(category).catch(() => []),

    // 4. Optional NewsAPI.org (if NEWSAPI_ORG_KEY present)
    fetchNewsApiOrg(category).catch(() => []),
  ];

  const results = await Promise.allSettled(providers);

  const rawArticles = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .flat();

  // Deduplicate articles across all providers
  const seenUrls = new Set();
  const seenTitles = new Set();
  const aggregatedCandidates = [];

  for (const raw of rawArticles) {
    const mapped = mapArticle(raw);
    mapped.category = detectCategory(mapped.title, mapped.description, mapped.category || category);
    const normTitle = normalizeTitle(mapped.title);

    if (mapped.url && seenUrls.has(mapped.url)) continue;
    if (normTitle && seenTitles.has(normTitle)) continue;

    if (mapped.url) seenUrls.add(mapped.url);
    if (normTitle) seenTitles.add(normTitle);

    aggregatedCandidates.push(mapped);
  }


  console.log(
    `📡 Multi-Provider Aggregator: Pooled ${aggregatedCandidates.length} unique articles across active feeds [Category: "${category}"]`
  );

  return aggregatedCandidates;
};
