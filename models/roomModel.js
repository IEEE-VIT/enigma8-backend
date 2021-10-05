const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User= require('./userModel')
const Room= require('./roomModel')
const Powerup= require('./powerupModel')
const Question= require('./questionModel')
require('mongoose-type-url');

const roomSchema= new mongoose.Schema({

  roomId: {
    type: String
  },

  roomNo: {
    type: String
  },
  
  
  questionId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],

  media: {
    type: mongoose.SchemaTypes.Url
  },

  title: {
    type: String
  },

  starQuota: {
    type: Number
  }

}
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
