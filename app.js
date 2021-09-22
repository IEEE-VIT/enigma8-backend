require("dotenv").config();
const cors = require("cors");

const express = require("express");
const authorized = require("./middleware/auth");

const mongoose = require("mongoose");
const authorizedRoutes = require("./routes/authorized");
const authRoutes = require("./routes/authentication");
const app = express();
const DB_URL = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

require("./config/passport");

//connect to mongoDB
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Database Connected!");
  })
  .catch((err) => {
    console.log("DB connect error:", err);
  });

app.use("/auth", authRoutes);
app.use("/authorized", authorized, authorizedRoutes);

app.get("/", (req, res) => {
  res.send("The server is running!");
});

app.listen(PORT, () => {
  console.log("🚀 Server Ready! at port:", PORT);
  console.log("Goto http://localhost:" + PORT);
});
