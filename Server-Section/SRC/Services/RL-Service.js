/**
 * Contextual Multi-Armed Bandit Reinforcement Learning (RL) Engine
 * Implements continuous dwell-time rewards, dynamic Q-value weighting,
 * epsilon-greedy exploration, and RL-grounded XAI reasoning.
 */

import { detectCategory } from "../utils/categoryDetector.js";
import UserQState from "../models/userQStateModel.js";

// In-memory Q-Table store for fast execution (hydrated dynamically from MongoDB)
const userQTables = new Map();

const DEFAULT_CATEGORIES = [
  "technology",
  "business",
  "sports",
  "science",
  "world",
  "entertainment",
  "health",
  "politics",
];

const ALPHA = 0.15; // Learning Rate
const EPSILON = 0.10; // Exploration Probability (10%)

/**
 * Hydrate user RL state from MongoDB into in-memory cache
 */
export const hydrateUserQTable = async (userId = "demo-user") => {
  try {
    const doc = await UserQState.findOne({ userId }).lean();
    const defaultWeights = {};
    DEFAULT_CATEGORIES.forEach((cat) => {
      defaultWeights[cat] = 1.0;
    });

    if (doc && doc.weights) {
      const loadedWeights = doc.weights instanceof Map ? Object.fromEntries(doc.weights) : doc.weights;
      const mergedWeights = { ...defaultWeights, ...loadedWeights };

      const state = {
        weights: mergedWeights,
        interactionCount: doc.interactionCount || 0,
        recentDwellCategory: doc.recentDwellCategory || null,
        lastDwellDuration: doc.lastDwellDuration || 0,
        history: [],
      };
      userQTables.set(userId, state);
      return state;
    }
  } catch (err) {
    console.warn("⚠️ User Q-Table MongoDB hydration fallback:", err.message);
  }

  // Fallback default
  const defaultWeights = {};
  DEFAULT_CATEGORIES.forEach((cat) => {
    defaultWeights[cat] = 1.0;
  });
  const newState = {
    weights: defaultWeights,
    interactionCount: 0,
    recentDwellCategory: null,
    lastDwellDuration: 0,
    history: [],
  };
  userQTables.set(userId, newState);
  return newState;
};

/**
 * Get or initialize a user's RL Q-Table state
 */
export const getUserQTable = (userId = "demo-user") => {
  if (!userQTables.has(userId)) {
    // Trigger background hydration
    hydrateUserQTable(userId).catch(() => {});
    
    // Immediate clean slate fallback
    const defaultWeights = {};
    DEFAULT_CATEGORIES.forEach((cat) => {
      defaultWeights[cat] = 1.0;
    });
    userQTables.set(userId, {
      weights: defaultWeights,
      interactionCount: 0,
      recentDwellCategory: null,
      lastDwellDuration: 0,
      history: [],
    });
  }
  return userQTables.get(userId);
};


/**
 * Calculate Reward (R) based on interaction type & continuous dwell time
 */
export const calculateReward = (event, duration = 0) => {
  switch (event) {
    case "save":
      return 10.0; // Maximum positive intent
    case "like":
      return 8.0; // High positive intent
    case "dislike":
      return -8.0; // Strong explicit negative intent!
    case "read":
      return 5.0; // Outbound source read
    case "modal_dwell":
      if (duration >= 15) return 5.0; // Deep read
      if (duration >= 5) return 3.0; // Moderate read
      if (duration >= 2) return 1.0; // Glance
      return -4.0; // Fast skip (<2s) -> Strong penalty!
    case "view":
      return 0.2; // Card impression
    default:
      return 0.0;
  }
};


/**
 * Update RL Q-Table upon receiving telemetry event
 */
export const processRLTelemetry = ({
  userId = "demo-user",
  category = "general",
  event,
  duration = 0,
}) => {
  const normCategory = detectCategory("", "", category);
  const qState = getUserQTable(userId);
  const reward = calculateReward(event, duration);

  // Initialize category weight if unknown
  if (!(normCategory in qState.weights)) {
    qState.weights[normCategory] = 1.0;
  }

  const oldWeight = qState.weights[normCategory];

  // For low-signal 'view' events (card impressions), do not decay high weights (if oldWeight >= reward)
  if (event === "view" && oldWeight >= reward) {
    return qState;
  }

  // Q-Learning Update Rule: W_cat = W_cat + alpha * (Reward - W_cat)
  const newWeight = Math.max(0.1, oldWeight + ALPHA * (reward - oldWeight));


  qState.weights[normCategory] = Number(newWeight.toFixed(3));
  qState.interactionCount += 1;
  if (event === "modal_dwell") {
    qState.recentDwellCategory = normCategory;
    qState.lastDwellDuration = duration;
  }

  qState.history.push({
    timestamp: new Date().toISOString(),
    event,
    category: normCategory,
    duration,
    reward,
    oldWeight,
    newWeight: qState.weights[normCategory],
  });

  // Keep last 30 interaction logs
  if (qState.history.length > 30) qState.history.shift();

  console.log(`\n🎮 [RL BANDIT UPDATE] User: "${userId}" | Event: "${event}" (${duration}s) | Category: "${normCategory}"`);
  console.log(`   Reward Signal (R): ${reward > 0 ? `+${reward}` : reward} | Weight: ${oldWeight.toFixed(2)} ➔ ${qState.weights[normCategory].toFixed(2)}`);

  // Asynchronously persist Q-State to MongoDB
  UserQState.updateOne(
    { userId },
    {
      $set: {
        weights: qState.weights,
        interactionCount: qState.interactionCount,
        recentDwellCategory: qState.recentDwellCategory,
        lastDwellDuration: qState.lastDwellDuration,
      },
    },
    { upsert: true }
  ).catch((err) => console.warn("⚠️ Failed to persist UserQState to MongoDB:", err.message));

  return qState;
};


/**
 * Rank candidate news articles using RL Contextual Q-Values + Epsilon-Greedy Exploration
 */
export const rankArticlesWithRL = (userId = "demo-user", articles = []) => {
  if (!articles || articles.length === 0) return [];

  const qState = getUserQTable(userId);
  const weights = qState.weights;

  // 1. Calculate Q-Score for each candidate article
  const scored = articles.map((art) => {
    const normCat = detectCategory(art.title, art.description, art.category);
    const catWeight = weights[normCat] !== undefined ? weights[normCat] : (weights["general"] || 1.0);
    
    // Recency decay factor (articles published recently get higher weight)
    const pubTime = art.publishedAt ? new Date(art.publishedAt).getTime() : Date.now();
    const hoursAgo = Math.max(0, (Date.now() - pubTime) / (1000 * 60 * 60));
    const recencyDecay = Math.max(0.6, 1.0 - (hoursAgo / 48) * 0.4);

    // Q-Score = CategoryWeight * RecencyDecay
    const qScore = catWeight * recencyDecay;

    return {
      ...art,
      category: normCat,
      qScore: Number(qScore.toFixed(2)),
      catWeight: Number(catWeight.toFixed(2)),
      isExploration: false,
    };
  });


  // 2. Sort candidates by Q-Score descending
  scored.sort((a, b) => b.qScore - a.qScore);

  // 3. Apply Epsilon-Greedy Exploration (10% chance to inject an unvisited/explored category)
  const isExploring = Math.random() < EPSILON && scored.length > 3;
  if (isExploring) {
    // Find highest scoring article from an unexplored/lower-weighted category
    const lowestCategory = Object.keys(weights).reduce((minCat, cat) =>
      weights[cat] < weights[minCat] ? cat : minCat
    , DEFAULT_CATEGORIES[0]);

    const exploreIndex = scored.findIndex(
      (art) => (art.category || "").toLowerCase() === lowestCategory
    );

    if (exploreIndex > 2) {
      const [exploreArticle] = scored.splice(exploreIndex, 1);
      exploreArticle.isExploration = true;
      exploreArticle.qScore = Number((exploreArticle.qScore + 1.5).toFixed(2));
      scored.splice(1, 0, exploreArticle); // Insert at position 2
      console.log(`🎲 [RL EPSILON EXPLORATION] Injected category "${lowestCategory}" into position #2 for diversity discovery.`);
    }
  }

  // 4. Attach Grounded RL XAI Explanations
  return scored.map((art, idx) => {
    let rlReason = "";
    if (art.isExploration) {
      rlReason = `Recommended to explore your interest in ${art.category || "new topics"}.`;
    } else if (art.catWeight >= 2.5) {
      rlReason = `Recommended because you spent deep reading time on ${art.category || "this topic"} articles and gave positive feedback.`;
    } else if (art.catWeight <= 0.5) {
      rlReason = `Ranked lower due to recent fast skips in ${art.category || "this topic"}.`;
    } else {
      rlReason = `Matches your reading habits in ${art.category || "this topic"}.`;
    }



    return {
      ...art,
      rlScore: art.qScore,
      rlReason,
      rlRank: idx + 1,
    };
  });
};
