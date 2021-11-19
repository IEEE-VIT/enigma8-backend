const mongoose = require("mongoose");
require("mongoose-type-url");

const questionSchema = new mongoose.Schema({
  questionNo: {
    type: Number,
    required: true,
  },

  text: {
    type: String,
  },

  media: {
    type: mongoose.SchemaTypes.Url,
  },

  mediaType: {
    type: String,
    enum: ["img", "vid"],
    default: ["img"],
  },

  answers: [{ type: String, required: true }],

  closeAnswers: [{ type: String, required: true }],

  hint: {
    type: String,
    required: true,
  },
  solvedCount: {
    type: Number,
    default: 0,
  },
  hangman: {
    type: String,
    required: true,
  },
  doubleHint: {
    type: String,
    required: true,
  },
  urlHint: {
    type: String,
    required: true,
  },
  javelin: {
    type: String,
    required: true,
  },
  revealCipher: {
    type: String,
    required: true,
  },
  newHieroglyphsCloseAnswer: {
    type: String,
    required: true,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
