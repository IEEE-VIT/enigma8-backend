const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");

router.post("/submitFeedback", feedbackController.getFeedback);

module.exports = router;