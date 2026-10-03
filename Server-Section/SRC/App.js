import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import newsRoutes from "./routes/newsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, "../../client/dist");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/news", newsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/saved", savedArticleRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Static file serving from client build if present
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Centralized error middleware
app.use(errorHandler);

export default app;
