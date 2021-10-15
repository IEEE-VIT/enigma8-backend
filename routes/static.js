const express = require("express");
const router = express.Router();
const { response } = require("../config/responseSchema");

const getTimer = require("../controllers/timerController");
const storyController = require("../controllers/storyController");

router.get("/timer", async (req, res) => {
  response(res, getTimer());
});

router.get("/story", storyController.story);
router.get("/fullStory", storyController.fullStory);

module.exports = router;
