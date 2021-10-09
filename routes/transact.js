const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {getQuestion} = require('../controllers/transactController');

router.post("/getQuestion", getQuestion)

// router.post("/submitAnswer", submitAnswer)

module.exports = router;
