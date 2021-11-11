const express = require("express");
const router = express.Router();
const Joi = require("joi");

const { getQuestion } = require("../controllers/transactController");
const { submitAnswer } = require("../controllers/transactController");
const { useHint } = require("../controllers/transactController");
const { utilisePowerup } = require("../controllers/transactController");

router.get("/getQuestion", getQuestion);
router.post("/submitAnswer", submitAnswer);

router.get("/useHint", useHint);
router.get("/usePowerup", utilisePowerup); 

module.exports = router;
