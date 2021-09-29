const express = require("express");
const router = express.Router();
const { response } = require("../config/responseSchema");

const getTimer = require("../controllers/timerController");

router.get("/timer", async (req, res) => {
  response(res, getTimer());
});

var intro = "This is a sample intro"

router.get("/intro", async (req, res) => {
  response(res, {
    intro: intro,
  });
});

var rules = ["Rule 1", "Rule 2", "Rule 3"]

router.get("/rules", async (req, res) => {
  response(res, {
    rules: rules,
  });
});

module.exports = router;
