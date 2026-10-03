import axios from "axios";

export const fetchGNews = async (category = "general") => {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return [];
  }

  try {
    const response = await axios.get("https://gnews.io/api/v4/top-headlines", {
      params: {
        token: apiKey,
        category: category === "top" ? "general" : category,
        lang: "en",
        max: 10,
      },
      timeout: 5000,
    });

    return (response.data.articles || []).map((art) => ({
      article_id: art.url || art.title,
      title: art.title,
      description: art.description || art.content || "",
      link: art.url,
      image_url: art.image,
      pubDate: art.publishedAt,
      source_id: art.source?.name || "GNews",
      category: [category],
    }));
  } catch (err) {
    console.warn("⚠️ GNews Provider warning:", err.response?.data?.errors?.[0] || err.message);
    return [];
  }
};
