import axios from "axios";
import { ollamaConfig } from "../config/ollamaConfig.js";

export const generateContentOllama = async (prompt) => {
  if (!ollamaConfig.enabled) {
    throw new Error("Ollama fallback is disabled in configuration.");
  }

  const url = `${ollamaConfig.baseUrl.replace(/\/$/, "")}/api/generate`;

  console.log(`🦙 Attempting Ollama fallback generation with model "${ollamaConfig.model}"...`);

  try {
    const response = await axios.post(
      url,
      {
        model: ollamaConfig.model,
        prompt: prompt,
        stream: false,
      },
      {
        timeout: 60000,
      }
    );

    if (response.data && response.data.response) {
      console.log(`✅ Ollama fallback generation succeeded using "${ollamaConfig.model}"`);
      return response.data.response;
    }

    throw new Error("Ollama API returned an empty or invalid response.");
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error(`❌ Ollama fallback failed [Model: ${ollamaConfig.model}]:`, errorMsg);
    throw new Error(`Ollama fallback failed: ${errorMsg}`);
  }
};
