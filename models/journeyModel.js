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
    default: false,
  },

  questionsStatus: [{
    type: String,
    enum: ["unlocked", "locked", "solved"],
    default: ["locked", "locked", "locked"]
  }],

  

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
