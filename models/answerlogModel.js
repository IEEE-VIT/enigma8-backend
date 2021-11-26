const { boolean } = require("joi");
const mongoose = require("mongoose");

require("mongoose-type-url");

const answerlogSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    roomNo: {
      type: String,
    },
    QNo: {
      type: String,
    },

    effectiveScore: {
      type: String,
    },
    answer: {
      type: String,
    },
    check: {
      type: String,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Answerlog", answerlogSchema);

module.exports = Feedback;
