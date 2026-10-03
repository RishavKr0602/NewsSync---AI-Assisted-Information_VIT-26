import Interaction from "../models/interactionModel.js";
import SavedArticle from "../models/savedArticleModel.js";
import { fetchAggregatedCandidates } from "./multiSourceService.js";
import { rankAndExplainCandidates } from "./aiService.js";
import { rankArticlesWithRL, getUserQTable } from "./rlService.js";

export const getPersonalizedRecommendations = async (userId = "demo-user") => {
    try {
        // 1. Fetch user's recent interactions & saved articles
        const recentInteractions = await Interaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .catch(() => []);

        const savedArticles = await SavedArticle.find({ userId })
            .sort({ savedAt: -1 })
            .limit(10)
            .lean()
            .catch(() => []);

        const userInteractions = [
            ...savedArticles.map((s) => ({ title: s.title, category: "saved" })),
            ...recentInteractions.map((i) => ({ title: i.articleId, category: i.event })),
        ].slice(0, 10);

        // 2. Fetch User RL Q-Table & Extract Top 2-3 Categories
        const userQState = getUserQTable(userId);
        const sortedRLCategories = Object.entries(userQState.weights)
            .filter(([cat]) => cat !== "top" && cat !== "general")
            .sort((a, b) => b[1] - a[1]);

        // Prioritize top 3 RL categories (e.g., sports if weight = 2.61)
        const topCategories = sortedRLCategories.slice(0, 3).map(([cat]) => cat);
        const fallbackCategories = ["technology", "business", "sports", "science", "world"];
        const poolCategories = Array.from(new Set([...topCategories, ...fallbackCategories]));

        console.log(`🎯 [RL RECOMMENDER POOLING] Top RL Categories for User "${userId}":`, topCategories);

        // Fetch candidate news pool weighted heavily by top RL categories
        const candidatePromises = poolCategories.map((cat) =>
            fetchAggregatedCandidates({ category: cat }).catch(() => [])
        );

        const poolResults = await Promise.all(candidatePromises);
        const rawCandidates = poolResults.flat();

        // 3. Deduplicate candidate pool
        const seenIds = new Set();
        const candidatePool = [];

        for (const article of rawCandidates) {
            if (article.id && !seenIds.has(article.id)) {
                seenIds.add(article.id);
                candidatePool.push(article);
            }
            if (candidatePool.length >= 45) break;
        }

        if (candidatePool.length === 0) {
            return [];
        }


        // 4. Rank Candidates via Contextual Multi-Armed Bandit (RL Engine)
        const rlRankedArticles = rankArticlesWithRL(userId, candidatePool);

        // 5. Grounded LLM XAI Generation via Gemini (with Ollama Fallback)
        const evaluations = await rankAndExplainCandidates(rlRankedArticles, userInteractions).catch(() => []);

        // 6. Merge RL Scores and XAI Explanations
        const finalResults = rlRankedArticles.map((article, idx) => {
            const evalItem = Array.isArray(evaluations) ? evaluations.find((e) => e.index === idx) : null;
            
            // Grounded XAI Reason: combine RL Bandit reason with LLM explanation
            const llmReason = evalItem && evalItem.reason ? evalItem.reason : "";
            let combinedReason = llmReason
                ? `${article.rlReason} ${llmReason}`
                : article.rlReason;

            // Strip any accidental emojis or percentages from XAI text
            combinedReason = combinedReason
                .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                .replace(/\(\+\d+(\.\d+)?\)/g, '')
                .replace(/\d+%/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            return {
                ...article,
                aiReason: combinedReason,
            };
        });


        // Terminal Logging

        console.log("\n==============================================================");

        console.log(`🎮 RL BANDIT RECOMMENDER STATE & PROFILES (User: "${userId}")`);
        console.log("--------------------------------------------------------------");
        console.log("📊 Active RL Category Weights (Q-Table):");
        Object.entries(userQState.weights).forEach(([cat, weight]) => {
            console.log(`   • ${cat.padEnd(14)} : Q-Weight = ${weight.toFixed(2)}`);
        });
        if (userQState.recentDwellCategory) {
            console.log(`⏱️ Last Dwell Signal: ${userQState.lastDwellDuration}s inside [${userQState.recentDwellCategory}]`);
        }

        console.log("\n🤖 RL BANDIT RERANKED & GROUNDED RECOMMENDATIONS:");
        console.log("--------------------------------------------------------------");
        finalResults.slice(0, 5).forEach((art, idx) => {
            console.log(`   ${idx + 1}. [RL Score: +${art.rlScore} | Rank #${art.rlRank} | Source: ${art.source}] "${art.title}"`);
            console.log(`      💡 ${art.aiReason}`);
        });
        console.log("==============================================================\n");

        return finalResults;
    } catch (error) {
        console.error("getPersonalizedRecommendations error:", error.message);
        throw error;
    }
};
