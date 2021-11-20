const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");

router.post("/submitFeedback", feedbackController.getFeedback);
router.get("/feedbackFilled", feedbackController.feedbackFilled);

module.exports = router;