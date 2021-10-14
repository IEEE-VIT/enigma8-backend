const express = require("express");
const router = express.Router();

const Joi = require("joi");

const {
  createUser,
  getPowerups,
  startJourney,
} = require("../controllers/userController");

router.post("/create", createUser);

router.get("/getPowerups", getPowerups);

router.post("/selectPowerup", startJourney);

module.exports = router;
