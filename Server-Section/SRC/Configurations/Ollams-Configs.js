export const ollamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3.2:3b",
  enabled: process.env.ENABLE_OLLAMA_FALLBACK !== "false",
};
