const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User= require('./userModel')
const Room= require('./roomModel')
const Powerup= require('./powerupModel')

const journeySchema= new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Room'
  },

  room_unlocked: {
    type: Boolean,
    default: false
  },

  question_1: {
    type: String,
    enum:['unlocked', 'locked', 'solved'],
    default:['locked']
  },

  question_2: {
    type: String,
    enum:['unlocked', 'locked', 'solved'],
    default:['locked']
  },

  question_3: {
    type: String,
    enum:['unlocked', 'locked', 'solved'],
    default:['locked']
  },

  powerup_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Powerup'
  },

  powerup_used: {
    type: Boolean,
    default: false
  }
});

const Journey = mongoose.model('Journey', journeySchema);

module.exports = Journey;