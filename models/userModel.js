const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, sparse: true },

    email: { required: true, type: String, unique: true },

    currentRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    fcmToken: [
      {
        type: "String",
      },
    ],
    stars: {
      type: "Number",
      default: 0,
    },
    score: {
      type: "Number",
      default: 0,
    },
    questionsSolved: {
      type: "Number",
      default: 0,
    },
    scoreLastUpdated: {
      type: "Date",
    },
    outreach: {
      type: "String",
      enum: [
        "instagram",
        "facebook",
        "reddit",
        "linkedin",
        "discord",
        "word of mouth",
        "others",
      ],
    },
    usedPowerups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Powerups" }],
    usedHints: [{ type: "ObjectId" }],
    currentQuestions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Questions" },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
