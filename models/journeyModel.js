const mongoose = require("mongoose");
require("mongoose-type-url");

const journeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Room",
  },

  roomUnlocked: {
    type: Boolean,
    default: true,
  },

  questionsStatus: [
    {
      type: String,
      enum: ["unlocked", "locked", "solved"],
      default: ["unlocked", "locked", "locked"],
    },
  ],

  powerupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Powerup",
  },

  powerupUsed: {
    type: String,
    default: false,
    enum: ["yes", "no", "active"],
  },

  stars: {
    type: Number,
    default: 0,
  },
});

const Journey = mongoose.model("Journey", journeySchema);

module.exports = Journey;
