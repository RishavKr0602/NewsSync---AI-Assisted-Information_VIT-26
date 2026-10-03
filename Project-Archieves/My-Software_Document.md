# Software Requirements Specification (SRS) & Engineering Standard: NewsLens-AI

---
## 1. Functional Requirements (FR)

- **FR-1 [Real-Time Candidate Pooling]**: The system MUST fetch breaking news candidate articles from external providers and map raw responses to standardized internal article representations.
- **FR-2 [RL Bandit Personalization]**: The system MUST compute dynamic personalized Q-scores for live news streams using a Contextual Multi-Armed Bandit algorithm based on live telemetry (`modal_dwell`, `like`, `save`, `dislike`, `read`).
- **FR-3 [MongoDB Q-State Persistence]**: User category Q-weights MUST be saved to MongoDB (`UserQState`) and hydrated automatically across server re-boots and user sessions.
- **FR-4 [Explainable AI (XAI)]**: The recommendation engine MUST generate transparent, natural-language human justifications (*"Why For You"*) without raw mathematical numbers or emojis on consumer cards.
- **FR-5 [Grounded Article Assistant]**: Users MUST be able to execute grounded AI Summaries, Plain-Language Explanations, Key Takeaways, Sentiment Analysis, and Interactive Q&A for any news story.
- **FR-6 [Telemetry Capture]**: Implicit and explicit user interaction events (`view`, `read`, `modal_dwell`, `like`, `dislike`, `save`, `share`, `ai_chat`) MUST be recorded with category tags and dwell duration metrics.
- **FR-7 [Multi-LLM Fallback]**: The AI inference pipeline MUST automatically degrade gracefully from Gemini 3.6 Flash -> Gemini 3.5 Flash -> Gemini 3.1 Flash-Lite -> Local Ollama (`llama3.2:3b`) when cloud APIs fail or rate limit.
- **FR-8 [Immersive Modal Reader & Action Alignment]**: The frontend UI MUST provide an Apple-inspired reader view with equalized Like/Dislike buttons, non-overflowing AI Assistant panel, and keyboard shortcuts (`Escape`, `Left Arrow`, `Right Arrow`).

---

## 2. Non-Functional Requirements (NFR)

- **NFR-1 [Performance & Latency]**: RL Q-score recalculation MUST respond within <= 5 milliseconds; telemetry ingestion MUST complete within <= 15 milliseconds.
- **NFR-2 [Resilience & High Availability]**: Multi-tier fallback MUST ensure zero application crashes when cloud API keys are missing or rate-limited.
- **NFR-3 [Maintainability & Modular Cohesion]**: Frontend and backend components MUST maintain high cohesion and single-responsibility boundaries.
- **NFR-4 [Usability & Quiet Luxury Aesthetics]**: The UI MUST implement pure-text cards, obsidian/titanium dark mode design, and equalized pill buttons.
- **NFR-5 [Security & Data Integrity]**: Database write operations MUST enforce unique constraints (`userId` + `articleId`) to prevent duplicate interaction or bookmark entries.

---

## 3. Test & Verification Matrix

| Test ID | Module / Component | Test Target | Verification Command / Procedure | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | React Client Bundle | Vite production bundle compilation | `npm run build:client` | **PASS** |
| **TC-02** | Express Server | App initialization & route binding | `node -e "import('./server/src/app.js')"` | **PASS** |
| **TC-03** | RL Bandit Service | Continuous dwell reward & Q-weight updates | In-memory Q-table calculation test | **PASS** |
| **TC-04** | MongoDB Q-State | User Q-table persistence across restarts | Hydration test via `UserQState.findOne()` | **PASS** |
| **TC-05** | LLM Engine | Resilient multi-tier Gemini/Ollama fallback | Execute inference with API key rate limits | **PASS** |
| **TC-06** | UI Reader Modal | Keyboard navigation & non-overlapping AI panel | Open reader modal and resize viewport | **PASS** |

---
**Document Revision**: 2.0 | **NewsLens-AI SRS Standard**
