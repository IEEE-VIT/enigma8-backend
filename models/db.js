const mongoose = require("mongoose");
const DB_URL = process.env.DB_URI;

module.exports = () => {
  try {
    // Connect to the MongoDB cluster
    mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log("Could not connect");
  }
  mongoose.set("debug", true);

  const dbConnection = mongoose.connection;

  return dbConnection;
};
