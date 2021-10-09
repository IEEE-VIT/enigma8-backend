const mongoose = require("mongoose");

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
    default: false,
  },

  question1: {
    type: String,
    enum: ["unlocked", "locked", "solved"],
    default: ["locked"],
  },

  question2: {
    type: String,
    enum: ["unlocked", "locked", "solved"],
    default: ["locked"],
  },

  question3: {
    type: String,
    enum: ["unlocked", "locked", "solved"],
    default: ["locked"],
  },

  powerupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Powerup",
  },

  powerupUsed: {
    type: Boolean,
    default: false,
  },

  stars: {
    type: Number,
    default: 0,
  },
});

const Journey = mongoose.model("Journey", journeySchema);

module.exports = Journey;
