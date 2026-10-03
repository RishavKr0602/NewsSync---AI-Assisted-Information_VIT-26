# Architecture & Data Flow: Real-Time RL Bandit Personalization Engine (XAI)

---

## 1. Overview
The **Real-Time Personalization Engine** in NewsLens-AI solves the traditional **Cold-Start Problem** on real-time news streams by replacing static offline machine learning models with a **Contextual Multi-Armed Bandit Reinforcement Learning (RL) Engine** coupled with **Grounded Explainable AI (XAI)**.

---

## 2. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Frontend (Vite + React SPA)"]
        UI["'For You' Feed"]
        Badge["Clean Pure-Text Cards & XAI Box"]
    end

    subgraph Server ["Express Backend (/api)"]
        Routes["/api/recommendations/:userId"]
        Controller["recommendationController.js"]
        RecService["recommendationService.js"]
        RLService["rlService.js (Contextual Bandit)"]
        AIService["aiService.js"]
    end

    subgraph Storage ["Database & LLM Services"]
        Mongo[("MongoDB (UserQState & Interactions)")]
        NewsAPI["Multi-Source Aggregator (NewsData, RSS, GNews)"]
        Gemini["Google Gemini 3.6 / 3.5 Flash API"]
        Ollama["Local Ollama Engine (llama3.2:3b)"]
    end

    UI -->|GET /api/recommendations/:userId| Routes
    Routes --> Controller
    Controller --> RecService
    
    RecService -->|1. Hydrate User Q-State| Mongo
    RecService -->|2. Dynamic Pool for Top RL Categories| NewsAPI
    RecService -->|3. Score Pool: Q(u,a) = W_cat * RecencyDecay| RLService
    
    RecService -->|4. Generate Natural Grounded XAI| AIService
    AIService -->|Inference Strategy| Gemini
    Gemini -->|Fallback| Ollama
    
    RecService -->|Ranked Feed with Clean XAI| Controller
    Controller -->|JSON Response| UI
    UI --> Badge
```

---

## 3. Step-by-Step Processing Pipeline

```
+-----------------------------------------------------------------------------------+
| 1. REAL-TIME TELEMETRY CAPTURE                                                     |
| User interacts (dwell, like, dislike, save, read) -> Express POST /api/interactions|
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| 2. ONLINE Q-LEARNING UPDATE & MONGODB PERSISTENCE                                  |
| - rlService computes Reward R (+10 Save, +8 Like, +5 Deep Dwell, -8 Dislike)      |
| - Updates category weight W_cat = W_cat + 0.15 * (R - W_cat)                      |
| - Asynchronously saves UserQState document to MongoDB                             |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| 3. DYNAMIC TOP-Q CANDIDATE POOLING                                                 |
| - RecService extracts top 2-3 categories with highest Q-weights                   |
| - Pools 45 candidate news items focused heavily on top RL categories              |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| 4. CONTEXTUAL BANDIT RE-RANKING & GROUNDED XAI                                    |
| - Scores pool: Q(u,a) = W_cat * RecencyDecay                                      |
| - Applies 10% Epsilon-Greedy exploration for category diversity                   |
| - Ingests natural interaction-based XAI reasons (zero emojis / zero raw math numbers)|
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| 5. CLEAN PURE-TEXT FRONTEND RENDER                                                |
| - Displays personalized feed sorted by Q-Score                                    |
| - Displays human-centric "Why For You" rationale box                             |
+-----------------------------------------------------------------------------------+
```

---

## 4. Key Technical Novelties

1. **Self-Contained Real-Time Adaptation**: Learns directly from live user telemetry without third-party offline dataset pre-training.
2. **Continuous Dwell-Time Penalties**: Differentiates between superficial fast-skips ($<2\text{s}$) and deep reading ($>15\text{s}$).
3. **MongoDB Persistence**: User Q-tables are persisted across server reboots and browser sessions.
4. **Resilient Multi-LLM Strategy**: Automatic fallback between Gemini 3.6 Flash, Gemini 3.5 Flash, Gemini 3.1 Flash-Lite, and local Ollama (`llama3.2:3b`).

---
**Revision**: 2.0 | **NewsLens-AI Intelligence Engine Specification**
