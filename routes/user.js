const express = require("express");
const router = express.Router();

const Joi = require("joi");

const {
  createUser,
  getPowerups,
  consumePowerup,
  getUser,
  startJourney,
} = require("../controllers/userController");

router.post("/create", createUser);

router.get("/getPowerups", getPowerups);

router.post("/selectPowerup", startJourney);

router.get("/getDetails", getUser);

module.exports = router;
