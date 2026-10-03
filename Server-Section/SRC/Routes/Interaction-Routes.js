import express from "express";

import {
  recordInteraction,
  getInteractions,
} from "../controllers/interactionController.js";

const router = express.Router();

router.post("/", recordInteraction);

router.get("/:userId", getInteractions);

export default router;
