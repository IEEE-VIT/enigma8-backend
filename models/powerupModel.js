const mongoose = require("mongoose");

const powerupSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  detail: {
    type: String,
  },

  icon: {
    type: String,
  },
});

const Powerup = mongoose.model("Powerup", powerupSchema);

module.exports = Powerup;
