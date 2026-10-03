# 📘 NewsLens-AI — End-to-End Technical Documentation & Architecture Specification

---

## 1. System Overview

**NewsLens-AI** is a real-time personalized news aggregator designed around **Contextual Multi-Armed Bandit Reinforcement Learning (RL)** and **Grounded Explainable AI (XAI)**.

Unlike legacy recommendation engines that rely on batch matrix factorization or static offline vector embeddings, NewsLens-AI adapts to user intent on-the-fly directly from live database interactions (`modal_dwell`, `like`, `save`, `dislike`, `read`) and persists category Q-weights ($W_{\text{cat}}$) into MongoDB (`UserQState`).

---

## 2. Mathematical & Technical Design Principles

### Candidate Pooling & Dual-Stage Pipeline

```
          [ Live Telemetry Stream ]
                      │ (modal_dwell, like, save, dislike)
                      ▼
     ┌──────────────────────────────────┐
     │ MongoDB Interaction & Q-State    │
     │ - UserQState (Persistent Weights)│
     └──────────────────────────────────┘
                      │ (Extract Top 2-3 RL Categories)
                      ▼
     ┌──────────────────────────────────┐
     │ Dynamic Candidate Pooling Stage  │
     │ Fetch 45 Multi-Provider News     │
     └──────────────────────────────────┘
                      │ (Deduplicated Candidate Pool)
                      ▼
     ┌──────────────────────────────────┐
     │ Contextual Bandit RL Reranking   │
     │ - Q(u,a) = W_cat * RecencyDecay  │
     │ - Epsilon-Greedy Exploration 10% │
     └──────────────────────────────────┘
                      │ (Grounded XAI Reason Ingestion)
                      ▼
     ┌──────────────────────────────────┐
     │ Personalized Feed Rendering      │
     └──────────────────────────────────┘
```

---

## 3. Data Schemas (MongoDB)

### `UserQState` Model (`server/src/models/userQStateModel.js`)
Tracks user's persistent RL Q-weights and dwell history:
```javascript
{
  userId: String,               // Unique user identifier
  weights: Map,                 // Category Q-weight map { sports: 4.03, technology: 1.00 }
  interactionCount: Number,     // Cumulative count of interactions
  recentDwellCategory: String,  // Last category user spent dwell time in
  lastDwellDuration: Number     // Duration in seconds
}
```

### `Interaction` Model (`server/src/models/interactionModel.js`)
Tracks implicit reading dwell and explicit intent actions:
```javascript
{
  userId: String,       // Unique user identifier
  articleId: String,    // Canonical article ID or URL
  event: String,        // 'view' | 'read' | 'modal_dwell' | 'like' | 'dislike' | 'save' | 'share' | 'ai_chat'
  duration: Number,     // Dwell duration in seconds
  category: String      // News topic category
}
```

---

## 4. Grounded AI & RL Integration

### Grounded Prompting Template (`server/src/prompts/prompts.js`)
```text
You are a Real-Time Explainable AI (XAI) Assistant.
Given the candidate story and user interaction context, generate a single concise natural-language sentence explaining why this story matches the user's reading habits.
Do NOT include markdown backticks, raw mathematical numbers, or emojis.
```

---

## 5. Backend Component Breakdown

- **`server.js`**: Server entry point; connects to MongoDB and boots Express HTTP server on port 5000.
- **`rlService.js`**: Core Contextual Multi-Armed Bandit RL engine with continuous dwell-time rewards, Q-weight updates, and MongoDB state persistence.
- **`categoryDetector.js`**: Intelligent fallback classifier that tags un-categorized RSS/API news items into standard topics using keyword matching.
- **`recommendationService.js`**: Dynamic candidate pooler that inspects user Q-tables and pulls focused news items for top RL categories.
- **`aiService.js`**: Multi-tier wrapper for Google Gemini SDK (`@google/genai`) with automatic Ollama fallback.
- **`articleMapper.js`**: Standardizes external news payloads into unified internal article schemas.

---
**Documentation Revision**: 2.0 | **NewsLens-AI Engineering Team**
