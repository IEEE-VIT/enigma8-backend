require("dotenv").config();
const cors = require("cors");
const logger = require("./config/logger");
logger.info("Server started");

const express = require("express");
const authorized = require("./middleware/auth");
const isEnigmaActive = require("./middleware/enigmaActive");
const isEnigmaAppActive = require("./middleware/enigmaAppActive");
const usernameCheck = require("./middleware/usernameCheck");

const connectToMongo = require("./models/db");

//routes imports
const authorizedRoutes = require("./routes/authorized");
const authRoutes = require("./routes/authentication");
const staticRoutes = require("./routes/static");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");
const transactRoutes = require("./routes/transact");
const gameRoutes = require("./routes/game");
const storyRoutes = require("./routes/story");
const notifRoutes = require("./routes/notifications");
const feedRoutes = require("./routes/feedback");

const app = express();
const DB_URL = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

require("./config/passport");

//connect to mongoDB
connectToMongo().on("connected", () => {
  console.log("✅ Mongoose is connected");
  logger.info("✅ Mongoose is connected");
});

app.use("web/auth", authRoutes);
app.use("web/authorized", authorized, authorizedRoutes);
app.use("web/static", staticRoutes);
app.use("web/user", authorized, userRoutes);
app.use("web/room", authorized, isEnigmaActive, usernameCheck, roomRoutes);
app.use(
  "web/transact",
  authorized,
  isEnigmaActive,
  usernameCheck,
  transactRoutes
);
app.use("web/game", authorized, isEnigmaActive, usernameCheck, gameRoutes);
app.use("web/story", authorized, isEnigmaActive, usernameCheck, storyRoutes);
app.use("web/notifs", authorized, isEnigmaActive, usernameCheck, notifRoutes);
app.use("web/feedback", authorized, isEnigmaActive, usernameCheck, feedRoutes);

app.use("app/auth", authRoutes);
app.use("app/authorized", authorized, authorizedRoutes);
app.use("app/static", staticRoutes);
app.use("app/user", authorized, userRoutes);
app.use("app/room", authorized, isEnigmaAppActive, usernameCheck, roomRoutes);
app.use(
  "app/transact",
  authorized,
  isEnigmaAppActive,
  usernameCheck,
  transactRoutes
);
app.use("app/game", authorized, isEnigmaAppActive, usernameCheck, gameRoutes);
app.use("app/story", authorized, isEnigmaAppActive, usernameCheck, storyRoutes);
app.use(
  "app/notifs",
  authorized,
  isEnigmaAppActive,
  usernameCheck,
  notifRoutes
);
app.use(
  "app/feedback",
  authorized,
  isEnigmaAppActive,
  usernameCheck,
  feedRoutes
);

app.get("/", (req, res) => {
  res.send("The server is running!");
});

app.listen(PORT, () => {
  console.log("🚀 Server Ready! at port:", PORT);
  logger.info(`🚀 Server Ready! at port: ${PORT}`);
});
