const express = require("express");
const router = express.Router();

const Joi = require("joi");

const { createUser, getPowerups } = require("../controllers/userController");

router.post("/create", createUser);

router.get("/getPowerups", getPowerups);

module.exports = router;
