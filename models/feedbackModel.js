const { boolean } = require("joi");
const mongoose = require("mongoose");

require("mongoose-type-url");

const feedbackSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  isVITStudent: {
    type: Boolean,
  },
  regNo: {
    type: String,
  },
  vitEmail: {
    type: String,
  },
  gameRating: {
    type: Number,
  },
  userExperience: {
    type: String,
  },
  featureIdeas: {
    type: String,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
