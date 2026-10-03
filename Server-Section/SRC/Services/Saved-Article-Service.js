import SavedArticle from "../models/savedArticleModel.js";

export const saveArticle = async ({
  userId,
  articleId,
  title,
  description,
  image,
  url,
  source,
  publishedAt,
}) => {
  const existingArticle = await SavedArticle.findOne({
    userId,
    articleId,
  });

  if (existingArticle) {
    return existingArticle;
  }

  const savedArticle = await SavedArticle.create({
    userId,
    articleId,
    title,
    description,
    image,
    url,
    source,
    publishedAt,
  });

  return savedArticle;
};

export const getSavedArticles = async (userId) => {
  return await SavedArticle.find({ userId })
    .sort({ createdAt: -1 });
};

export const unsaveArticle = async (userId, articleId) => {
  return await SavedArticle.findOneAndDelete({
    userId,
    articleId,
  });
};
