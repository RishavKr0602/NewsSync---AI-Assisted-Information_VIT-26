import Interaction from "../models/interactionModel.js";
import { processRLTelemetry } from "./rlService.js";

export const createInteraction = async ({
  userId = "demo-user",
  articleId,
  event,
  duration = 0,
  category = "general",
}) => {
  // Save interaction to MongoDB
  const interaction = await Interaction.create({
    userId,
    articleId,
    event,
    duration,
  });

  console.log(`📌 [NEW INTERACTION LOGGED] Event: "${event}" | Article ID: "${articleId}" | User: "${userId}" | Dwell: ${duration}s`);

  // Instantly feed interaction & dwell duration into RL Bandit Engine
  processRLTelemetry({ userId, category, event, duration });

  return interaction;
};

export const getUserInteractions = async (userId) => {
  return await Interaction.find({ userId }).sort({ createdAt: -1 });
};
