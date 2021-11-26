const express = require("express");
const router = express.Router();
const {
  iWonderWhatThisIs,
} = require("../controllers/answerController");

router.get("/interesting-route", iWonderWhatThisIs);

module.exports = router;
