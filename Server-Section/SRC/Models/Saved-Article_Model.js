import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    articleId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

savedArticleSchema.index(
  { userId: 1, articleId: 1 },
  { unique: true }
);

const SavedArticle = mongoose.model(
  "SavedArticle",
  savedArticleSchema
);

export default SavedArticle;
