const express = require("express");
const router = express.Router();
const { response } = require("../config/responseSchema");

const getTimer = require("../controllers/timerController");

router.get("/timer", async (req, res) => {
  response(res, getTimer());
});

module.exports = router;
