export const geminiConfig = {
  primaryModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  fallbackModels: process.env.GEMINI_FALLBACK_MODELS
    ? process.env.GEMINI_FALLBACK_MODELS.split(",").map((m) => m.trim()).filter(Boolean)
    : [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
      ],
};
