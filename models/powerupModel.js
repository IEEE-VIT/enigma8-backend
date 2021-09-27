const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Journey= require('./journeyModel');

const powerupSchema= new mongoose.Schema({

  powerupId: {
    type: String,
    required: true
  },

  name: {
    type: String
  },

  detail:
  {
    type: String
  },

  icon: {
    type: String   //shouldn't it be a URL instead?
  }
}
);

const Powerup = mongoose.model('Powerup', powerupSchema);

module.exports = Powerup;



