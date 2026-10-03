import express from "express";

import {
  summarize,
  explain,
  keypoints,
  sentiment,
  chat,
  dailyBrief,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/summarize", summarize);

router.post("/explain", explain);

router.post("/keypoints", keypoints);

router.post("/sentiment", sentiment);

router.post("/chat", chat);

router.post("/daily-brief", dailyBrief);

export default router;
