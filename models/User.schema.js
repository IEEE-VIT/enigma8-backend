const mongoose = require("mongoose");

// define the Contact model schema
const UserSchema = new mongoose.Schema({
  user_name: String,
  email_id: String,
  token: String,
});

module.exports = mongoose.model("User", UserSchema);
