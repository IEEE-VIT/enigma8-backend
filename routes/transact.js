const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {getQuestion} = require('../controllers/transactController');
const {submitAnswer} = require('../controllers/transactController');

router.get("/getQuestion", getQuestion)
router.post("/submitAnswer", submitAnswer)

module.exports = router;
