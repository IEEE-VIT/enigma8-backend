const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, sparse: true },

    email: { required: true, type: String, unique: true },
    isCollegeStudent: {
      type: "Boolean",
    },
    fcmToken: {
      type: "String",
    },
    stars: {
      type: "Number",
      default: 0,
    },
    score: {
      type: "Number",
      default: 0,
    },
    outreach: {
      type: "String",
    },
    usedPowerups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Powerups" }],
    usedHints: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hints" }],
    currentQuestios: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Questions" },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
