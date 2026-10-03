export const mapArticle = (article) => {
  let content = article.content ?? article.full_content ?? "";
  let description = article.description ?? article.snippet ?? "";

  const isPaywallString = (str) =>
    typeof str === 'string' &&
    (str.includes("ONLY AVAILABLE IN PAID PLANS") ||
     str.includes("ONLY AVAILABLE IN PAID PLAN") ||
     str.toLowerCase().includes("paid plan"));

  if (isPaywallString(content)) {
    content = "";
  }
  if (isPaywallString(description)) {
    description = "";
  }

  const finalDescription = description || content || "No description available.";

  return {
    id: article.article_id ?? article.id ?? article.link,

    title: article.title ?? "No Title",

    description: finalDescription,

    content: content,

    image:
      article.image_url ??
      article.urlToImage ??
      article.image ??
      "https://placehold.co/600x400?text=No+Image",

    url: article.link ?? article.url,

    source: typeof article.source_name === 'string' ? article.source_name : (article.source?.name || article.source || "News"),

    publishedAt: article.pubDate ?? article.publishedAt,

    category:
      Array.isArray(article.category)
        ? article.category[0] ?? ""
        : article.category ?? "",

    country:
      Array.isArray(article.country)
        ? article.country[0] ?? ""
        : article.country ?? "",

    language: article.language ?? "",
  };
};
