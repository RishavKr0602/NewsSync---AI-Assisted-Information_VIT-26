import express from "express";

import {
  getNews,
  searchNews,
  getCategoryNews,
  getCountryNews,
  getLanguageNews,
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getNews);

router.get("/search", searchNews);

router.get("/category/:category", getCategoryNews);

router.get("/country/:country", getCountryNews);

router.get("/language/:language", getLanguageNews);

export default router;
