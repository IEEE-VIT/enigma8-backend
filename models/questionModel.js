const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User= require('./userModel')
const Room= require('./roomModel')
const Powerup= require('./powerupModel')

const questionSchema= new mongoose.Schema({

  questionId: {
    type: String,
    required: true
  },

  questionNo: {
    type: Number,
    required: true
  },

  text: {
    type: String
  },

  media: {
    type: mongoose.SchemaTypes.Url
  },

  mediaType: {
    type: String,
    enum:['img', 'vid'],
    default:['img']
  },

  answers: {
    [{type:String, required: true}]
  },

  closeAnswers: {
    [{type:String, required: true}]
  },

  hints: {
    [{type:String, required: true}]
  }
}
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;



