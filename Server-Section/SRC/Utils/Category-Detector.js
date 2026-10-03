/**
 * Smart Keyword-based Category Fallback Classifier
 * Ensures articles fetched from RSS feeds or APIs without explicit category metadata
 * are properly classified into standard categories (sports, technology, business, science, etc.)
 */

const KEYWORD_MAP = {
  sports: [
    "sport", "sports", "cricket", "football", "soccer", "tennis", "basketball", "nba",
    "f1", "formula 1", "racing", "golf", "olympics", "athlete", "stadium", "championship",
    "tournament", "league", "trophy", "goal", "score", "coach", "player", "match",
    "grand prix", "premier league", "world cup", "ipl", "super bowl", "marathon"
  ],
  technology: [
    "technology", "tech", "ai", "artificial intelligence", "software", "hardware",
    "quantum", "chip", "microchip", "semiconductor", "apple", "google", "microsoft",
    "nvidia", "meta", "cybersecurity", "cyber", "app", "digital", "robotics", "robot",
    "cloud", "algorithm", "smartphone", "gadget", "llm", "openai", "chatgpt"
  ],
  business: [
    "business", "market", "stock", "stocks", "economy", "economic", "inflation",
    "bank", "banking", "trade", "investment", "investor", "startup", "revenue",
    "profit", "financial", "finance", "ceo", "dollar", "crypto", "bitcoin", "fed",
    "interest rate", "wall street", "merger", "earnings"
  ],
  science: [
    "science", "space", "nasa", "planet", "galaxy", "physics", "biology",
    "climate", "ocean", "energy", "fusion", "laboratory", "lab", "experiment",
    "discovery", "astronomy", "telescope", "gene", "genetics", "species"
  ],
  health: [
    "health", "medical", "disease", "flu", "virus", "cancer", "vaccine", "doctor",
    "hospital", "medicine", "who", "patient", "treatment", "pharma", "pandemic"
  ],
  politics: [
    "politics", "political", "president", "presidential", "election", "debate",
    "congress", "senate", "parliament", "government", "policy", "vote", "voter", "candidate", "candidates"
  ],
  world: [
    "world news", "global news", "international", "summit", "diplomacy", "diplomatic",
    "treaty", "united nations", "border", "geopolitics"
  ]
};

export const detectCategory = (title = "", description = "", fallbackCategory = "general") => {
  const text = `${title} ${description}`.toLowerCase();
  
  // 1. If explicit category is valid and not generic, use it
  const cleanFallback = (fallbackCategory || "").toLowerCase().trim();
  if (
    cleanFallback &&
    cleanFallback !== "top" &&
    cleanFallback !== "general" &&
    cleanFallback !== "news"
  ) {
    return cleanFallback;
  }

  // 2. Keyword match scoring
  let bestCategory = cleanFallback || "general";
  let maxScore = 0;

  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += kw.length > 5 ? 2 : 1; // Give higher weight to distinct keywords
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
};
