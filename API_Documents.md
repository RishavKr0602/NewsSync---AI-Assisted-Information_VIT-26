# REST API Reference Documentation: NewsSync-AI

Base URL: `http://localhost:5000/api`

---

## 1. News Endpoints (`/api/news`)

### 1.1. Fetch Latest News
- **HTTP Method**: `GET`
- **Endpoint**: `/api/news`
- **Query Parameters**:
  - `category` (optional, string): Filter news category (`technology`, `business`, `sports`, `health`, `science`, `world`, `entertainment`, `politics`).
  - `page` (optional, string): Pagination cursor token.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "articles": [
    {
      "id": "news_12345",
      "title": "NASA Unveils New Deep Space Telescope Array",
      "description": "Astronomers discover unprecedented atmospheric details on distant exoplanets.",
      "image": "https://images.example.com/nasa.jpg",
      "url": "https://example.com/nasa-telescope",
      "source": "TechCrunch",
      "category": "science",
      "publishedAt": "2026-09-19T20:00:00Z"
    }
  ],
  "nextPage": "page_token_abc123"
}
```

---

### 1.2. Search News Articles
- **HTTP Method**: `GET`
- **Endpoint**: `/api/news/search`
- **Query Parameters**:
  - `q` (**required**, string): Search keyword query.
  - `page` (optional, string): Pagination token.

---

## 2. Personalization & Recommendation Endpoints (`/api/recommendations`)

### 2.1. Fetch RL Personalized Feed with Grounded XAI
- **HTTP Method**: `GET`
- **Endpoint**: `/api/recommendations/:userId`
- **Path Parameters**:
  - `userId` (string): Unique user identification token (e.g. `demo-user`).

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "articles": [
    {
      "id": "rec_9876",
      "title": "Quantum Supremacy Milestone Achieved in Semiconductor Design",
      "description": "Researchers demonstrate 100x speedup in chip simulation using hybrid quantum logic.",
      "category": "technology",
      "aiReason": "Recommended because you spent deep reading time on technology articles and gave positive feedback.",
      "source": "Wired",
      "publishedAt": "2026-09-19T18:30:00Z"
    }
  ]
}
```

---

## 3. Telemetry & User Interactions (`/api/interactions`)

### 3.1. Record User Action Telemetry
- **HTTP Method**: `POST`
- **Endpoint**: `/api/interactions`
- **Request Body**:
```json
{
  "userId": "demo-user",
  "articleId": "news_12345",
  "event": "modal_dwell",
  "duration": 18,
  "category": "sports"
}
```
*Valid `event` values: `view`, `click`, `read`, `modal_dwell`, `like`, `dislike`, `save`, `share`, `ai_summary`, `ai_chat`.*

#### Sample Response (`201 Created`)
```json
{
  "success": true,
  "interaction": {
    "userId": "demo-user",
    "articleId": "news_12345",
    "event": "modal_dwell",
    "duration": 18,
    "category": "sports"
  }
}
```

---

## 4. Bookmarks & Saved Reading List (`/api/saved`)

### 4.1. Save Article
- **HTTP Method**: `POST`
- **Endpoint**: `/api/saved`
- **Request Body**:
```json
{
  "userId": "demo-user",
  "articleId": "news_12345",
  "title": "NASA Unveils New Deep Space Telescope Array",
  "description": "Astronomers discover unprecedented details.",
  "source": "TechCrunch",
  "url": "https://example.com/nasa-telescope"
}
```

### 4.2. Fetch User Saved Articles
- **HTTP Method**: `GET`
- **Endpoint**: `/api/saved/:userId`

### 4.3. Remove Article from Reading List
- **HTTP Method**: `DELETE`
- **Endpoint**: `/api/saved/:userId/:articleId`

---

## 5. Grounded AI Intelligence Endpoints (`/api/ai`)

### 5.1. Generate Story Summary
- **HTTP Method**: `POST`
- **Endpoint**: `/api/ai/summarize`
- **Request Body**: `{ "text": "Full story content..." }`

### 5.2. Grounded Story Chat (Q&A)
- **HTTP Method**: `POST`
- **Endpoint**: `/api/ai/chat`
- **Request Body**: `{ "text": "Full story content...", "question": "What is the key takeaway?" }`

---
**API Reference**: Version 2.0 | **NewsLens-AI Platform**
