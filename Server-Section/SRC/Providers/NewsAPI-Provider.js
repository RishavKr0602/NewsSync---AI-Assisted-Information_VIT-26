import axios from "axios";

export const fetchNewsApiOrg = async (category = "general") => {
  const apiKey = process.env.NEWSAPI_ORG_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return [];
  }

  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        apiKey: apiKey,
        category: category === "top" ? "general" : category,
        language: "en",
        pageSize: 10,
      },
      timeout: 5000,
    });

    return (response.data.articles || []).map((art) => ({
      article_id: art.url || art.title,
      title: art.title,
      description: art.description || art.content || "",
      link: art.url,
      image_url: art.urlToImage,
      pubDate: art.publishedAt,
      source_id: art.source?.name || "NewsAPI.org",
      category: [category],
    }));
  } catch (err) {
    console.warn("⚠️ NewsAPI.org Provider warning:", err.response?.data?.message || err.message);
    return [];
  }
};
