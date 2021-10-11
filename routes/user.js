const express = require("express");
const router = express.Router();

const Joi = require("joi");

const {
  createUser,
  getPowerups,
  consumePowerup,
} = require("../controllers/userController");

router.post("/create", createUser);

router.get("/getPowerups", getPowerups);

router.post("/selectPowerup", consumePowerup);

module.exports = router;
