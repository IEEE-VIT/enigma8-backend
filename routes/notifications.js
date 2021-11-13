const express = require("express");
const router = express.Router();

const { notifications} = require("../controllers/notificationController");

router.get("/notifications", notifications);

module.exports = router;