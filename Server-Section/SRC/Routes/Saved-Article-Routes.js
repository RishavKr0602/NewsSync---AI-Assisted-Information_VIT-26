import express from "express";

import {
  save,
  getSaved,
  removeSaved,
} from "../controllers/savedArticleController.js";

const router = express.Router();

router.post("/", save);

router.get("/:userId", getSaved);

router.delete("/:userId/:articleId", removeSaved);

export default router;
