const { boolean } = require("joi");
const mongoose = require("mongoose");

require("mongoose-type-url");

const feedbackSchema = new mongoose.Schema({
    email: {
      type: String, 
    },
    isVITStudent: {
      type: Boolean
    },
    gameRating: {
      type: Number
    },
    userExperience: {
      type: String
    },
    featureIdeas: {
      type: String
    },
    difficulties: {
      type: String
    },
    other: {
      type: String
    }
  });
  
const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
  