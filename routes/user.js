const express = require("express");
const router = express.Router();

const Joi = require("joi");

const createUser = require("../controllers/userController");

router.post("/create", createUser);

module.exports = router;
