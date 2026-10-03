import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
  timeout: 5000,
});

const RSS_FEEDS = {
  technology: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" },
  ],
  business: [
    { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml" },
    { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedsidefmt?source=cnbcnews&id=10000664&format=xml" },
  ],
  sports: [
    { name: "BBC Sport", url: "http://feeds.bbci.co.uk/sport/rss.xml" },
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news" },
  ],
  science: [
    { name: "BBC Science", url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
    { name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/all.xml" },
  ],
  world: [
    { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "NY Times World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  ],
  top: [
    { name: "BBC Top News", url: "http://feeds.bbci.co.uk/news/rss.xml" },
    { name: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=top-news" },
  ],
};

const extractImageUrl = (item) => {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  // Try extracting from HTML img tag in contentEncoded or description
  const content = item.contentEncoded || item.description || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

export const fetchRssNews = async (category = "top") => {
  const catKey = RSS_FEEDS[category.toLowerCase()] ? category.toLowerCase() : "top";
  const feedsToFetch = RSS_FEEDS[catKey] || RSS_FEEDS.top;

  const results = [];

  const promises = feedsToFetch.map(async (feed) => {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = (feedData.items || []).slice(0, 10).map((item) => ({
        article_id: item.guid || item.link || item.title,
        title: item.title ? item.title.trim() : "Untitled",
        description: item.contentSnippet || item.summary || item.title || "",
        link: item.link || "",
        image_url: extractImageUrl(item),
        pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
        source_id: feed.name,
        category: [catKey],
      }));
      results.push(...items);
    } catch (err) {
      console.warn(`⚠️ RSS Feed failed [${feed.name}]:`, err.message);
    }
  });

  await Promise.allSettled(promises);
  return results;
};
