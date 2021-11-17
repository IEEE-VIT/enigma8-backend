const express = require("express");
const router = express.Router();
const isEnigmaActive = require("../middleware/enigmaActive");
const usernameCheck = require("../middleware/usernameCheck");

const Joi = require("joi");

const {
  createUser,
  getPowerups,
  getUser,
  startJourney,
  addFCM,
} = require("../controllers/userController");

router.post("/create", createUser);
router.post("/addFCM", usernameCheck, addFCM);
router.get("/getDetails", usernameCheck, getUser);
router.get("/getPowerups", isEnigmaActive, usernameCheck, getPowerups);
router.post("/selectPowerup", isEnigmaActive, usernameCheck, startJourney);

module.exports = router;
