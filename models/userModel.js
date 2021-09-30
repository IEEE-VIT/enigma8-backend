const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, unique: true },
    oAuthId: String,
    email: { required: true, type: String, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
