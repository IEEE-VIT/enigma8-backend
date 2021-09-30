const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, unique: true },

    email: { required: true, type: String, unique: true },
    isCollegeStudent: {
      type: "Boolean",
    },
    fcmToken: {
      type: "String",
    },
    stars: {
      type: "Number",
    },
    score: {
      type: "Number",
    },
    outreach: {
      type: "String",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
