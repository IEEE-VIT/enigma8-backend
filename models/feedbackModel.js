const mongoose = require("mongoose");

require("mongoose-type-url");

const feedbackSchema = new mongoose.Schema({
    email: {
      type: String,
    },
    text: {
        type: String,
    },
  });
  
const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
  