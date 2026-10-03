import mongoose from "mongoose";

const userQStateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    weights: {
      type: Map,
      of: Number,
      default: {},
    },
    interactionCount: {
      type: Number,
      default: 0,
    },
    recentDwellCategory: {
      type: String,
      default: null,
    },
    lastDwellDuration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserQState = mongoose.model("UserQState", userQStateSchema);

export default UserQState;
