const express = require("express");
const router = express.Router();
const usernameCheck = require("../middleware/usernameCheck");

const Joi = require("joi");

const {
  createUser,
  getUser,

  addFCM,
} = require("../controllers/userController");

router.post("/create", createUser);
router.post("/addFCM", addFCM);
router.get("/getDetails", usernameCheck, getUser);

module.exports = router;
