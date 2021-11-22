const express = require("express");
const app = express.Router();

const authorized = require("../middleware/auth");
const isEnigmaActive = require("../middleware/enigmaActive");
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
app.use("/room", authorized, isEnigmaActive, usernameCheck, roomRoutes);
app.use("/transact", authorized, isEnigmaActive, usernameCheck, transactRoutes);
app.use("/game", authorized, isEnigmaActive, usernameCheck, gameRoutes);
app.use("/story", authorized, isEnigmaActive, usernameCheck, storyRoutes);
app.use("/notifs", authorized, isEnigmaActive, usernameCheck, notifRoutes);
app.use("/feedback", authorized, isEnigmaActive, usernameCheck, feedRoutes);

app.get("/user/getPowerups", isEnigmaActive, usernameCheck, getPowerups);
app.post("/user/selectPowerup", isEnigmaActive, usernameCheck, startJourney);

module.exports = app;
