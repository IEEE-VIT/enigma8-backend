const express = require("express");
const router = express.Router();

const storyController = require("../controllers/storyController");

router.get("/currentStory", storyController.story);
router.get("/fullStory", storyController.fullStory);

module.exports = router;