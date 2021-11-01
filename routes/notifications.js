const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");

router.post("/internal", notificationController.internal);
router.get("/notifications", notificationController.notifications);

module.exports = router;