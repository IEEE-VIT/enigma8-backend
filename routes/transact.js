const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {getQuestion} = require('../controllers/transactController');
const {useHint} = require('../controllers/transactController');

router.get("/getQuestion", getQuestion)

router.get("/useHint", useHint)

module.exports = router;
