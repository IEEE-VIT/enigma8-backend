require("dotenv").config();

const express = require("express");
//const cors = require("cors");

const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");
const app = express();

const DB_URL = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());

//app.use(cors());

app.use("/api", apiRoutes);

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Database Connected!");
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server Ready! at port: localhost", PORT);
});
