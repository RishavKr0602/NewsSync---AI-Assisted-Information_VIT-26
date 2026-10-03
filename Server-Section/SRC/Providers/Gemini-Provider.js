import { GoogleGenAI } from "@google/genai";
import { geminiConfig } from "../config/geminiConfig.js";
import { ollamaConfig } from "../config/ollamaConfig.js";
import { generateContentOllama } from "./ollamaProvider.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateContent = async (prompt) => {
  const modelsToTry = Array.from(
    new Set([geminiConfig.primaryModel, ...geminiConfig.fallbackModels])
  );

  let lastError = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== "") {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of modelsToTry) {
      const maxRetries = 1;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🌐 [GEMINI TRY] Attempting model "${model}"...`);
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });

          if (response && response.text) {
            console.log(`✨ [GEMINI SUCCESS] Response generated using Gemini model "${model}".`);
            return response.text;
          }
        } catch (error) {
          lastError = error;
          const status = error.status || error.code || 500;
          const errMsg = error.message || "Unknown error";

          console.warn(
            `⚠️ [GEMINI FAIL] Model "${model}" failed [Status: ${status} | Reason: ${errMsg}].`
          );

          // If the model does not exist (404) or key is invalid (400/403), don't retry same model
          if (status === 404 || status === 400 || status === 403) {
            break;
          }

          if (attempt < maxRetries) {
            await sleep(300 * attempt);
          }
        }
      }
    }
    console.warn(
      `❌ [GEMINI EXHAUSTED] All Gemini models failed: ${lastError?.message || lastError}`
    );
  } else {
    console.warn("⚠️ [GEMINI SKIPPED] GEMINI_API_KEY is missing or empty.");
  }

  // Fallback to local Ollama instance if enabled
  if (ollamaConfig.enabled) {
    try {
      console.log(`🦙 [OLLAMA FALLBACK] Switching to local Ollama engine ("${ollamaConfig.model}")...`);
      const ollamaText = await generateContentOllama(prompt);
      console.log(`✅ [OLLAMA SUCCESS] Response generated using local Ollama model ("${ollamaConfig.model}").`);
      return ollamaText;
    } catch (ollamaError) {
      console.error(`❌ [OLLAMA FAIL] Ollama engine failed: ${ollamaError.message}`);
    }
  }

  throw new Error(
    `AI generation failed across all Gemini models and local Ollama fallback: ${lastError?.message || "All AI engines unreachable"}`
  );
};
