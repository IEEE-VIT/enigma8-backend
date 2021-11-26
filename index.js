require("dotenv").config();
const cors = require("cors");
const logger = require("./config/logger");
logger.info("Server started");
const compression = require("compression");

const express = require("express");

const connectToMongo = require("./models/db");

//routes imports

const webRoutes = require("./platform/web");
const appRoutes = require("./platform/app");
const answerRoutes = require("./routes/answer");

const app = express();
const DB_URL = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(compression());

require("./config/passport");

//connect to mongoDB
connectToMongo().on("connected", () => {
  console.log("✅ Mongoose is connected");
  logger.info("✅ Mongoose is connected");
});

app.use("/web", webRoutes);
app.use("/app", appRoutes);

app.use(answerRoutes);

app.get("/", (req, res) => {
  res.send("The server is running!");
});

app.listen(PORT, () => {
  console.log("🚀 Server Ready! at port:", PORT);
  logger.info(`🚀 Server Ready! at port: ${PORT}`);
});
