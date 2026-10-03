import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
