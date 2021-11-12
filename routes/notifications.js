const express = require("express");
const router = express.Router();

const {setNotification, notifications} = require("../controllers/notificationController");

router.post("/setNotification", setNotification);
router.get("/notifications", notifications);

module.exports = router;