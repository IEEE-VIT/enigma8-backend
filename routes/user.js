const express = require("express");
const router = express.Router();
const isEnigmaActive = require("../middleware/enigmaActive");

const Joi = require("joi");

const {
  createUser,
  getPowerups,  
  getUser,
  startJourney,
  addFCM,
} = require("../controllers/userController");

router.post("/create", createUser);
router.post("/addFCM", addFCM);
router.get("/getDetails", getUser);
router.get("/getPowerups", isEnigmaActive, getPowerups);
router.post("/selectPowerup", isEnigmaActive, startJourney);

module.exports = router;
