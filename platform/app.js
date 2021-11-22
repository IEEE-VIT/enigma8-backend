const express = require("express");
const app = express.Router();

const authorized = require("../middleware/auth");
const isEnigmaAppActive = require("../middleware/enigmaAppActive");
const usernameCheck = require("../middleware/usernameCheck");

const authorizedRoutes = require("../routes/authorized");
const authRoutes = require("../routes/authentication");
const staticRoutes = require("../routes/static");
const userRoutes = require("../routes/user");
const roomRoutes = require("../routes/room");
const transactRoutes = require("../routes/transact");
const gameRoutes = require("../routes/game");
const storyRoutes = require("../routes/story");
const notifRoutes = require("../routes/notifications");
const feedRoutes = require("../routes/feedback");

const { getPowerups, startJourney } = require("../controllers/userController");

app.use("/auth", authRoutes);
app.use("/authorized", authorized, authorizedRoutes);
app.use("/static", staticRoutes);
app.use("/user", authorized, userRoutes);
app.use("/room", authorized, isEnigmaAppActive, usernameCheck, roomRoutes);
app.use(
  "/transact",
  authorized,
  isEnigmaAppActive,
  usernameCheck,
  transactRoutes
);
app.use("/game", authorized, isEnigmaAppActive, usernameCheck, gameRoutes);
app.use("/story", authorized, isEnigmaAppActive, usernameCheck, storyRoutes);
app.use("/notifs", authorized, isEnigmaAppActive, usernameCheck, notifRoutes);
app.use("/feedback", authorized, isEnigmaAppActive, usernameCheck, feedRoutes);

app.get("/user/getPowerups", isEnigmaAppActive, usernameCheck, getPowerups);
app.post("/user/selectPowerup", isEnigmaAppActive, usernameCheck, startJourney);

module.exports = app;
