import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    articleId: {
      type: String,
      required: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      enum: [
        "view",
        "click",
        "read",
        "modal_dwell",
        "like",
        "save",
        "dislike",
        "share",

        "ai_summary",
        "ai_chat",
      ],
    },

    duration: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      default: "general",
    },
  },

  {
    timestamps: true,
  }
);

const Interaction = mongoose.model(
  "Interaction",
  interactionSchema
);

export default Interaction;
