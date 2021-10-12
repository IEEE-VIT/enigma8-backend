const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {getQuestion} = require('../controllers/transactController');

router.post("/getQuestion", getQuestion)

module.exports = router;
