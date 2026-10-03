import axios from "axios";
import { newsConfig } from "../config/newsConfig.js";

const BASE_URL = "https://newsdata.io/api/1/latest";

export const fetchNews = async ({
  q = "",
  category = "",
  country = newsConfig.country,
  language = newsConfig.language,
  page = "",
} = {}) => {
  try {
    const params = {
      apikey: process.env.NEWSDATA_API_KEY,
      size: newsConfig.size,
    };

    if (q) {
      params.q = q;
    } else {
      if (language) params.language = language;
      if (country) params.country = country;
      if (category) params.category = category;
    }

    if (page) params.page = page;

    const response = await axios.get(BASE_URL, { params });

    return {
      results: response.data.results || [],
      nextPage: response.data.nextPage || null,
    };
  } catch (error) {
    console.error("NewsData Error:", error.response?.data || error.message);
    throw error;
  }
};
