const express = require("express");
const router = express.Router();

const {internal, notifications} = require("../controllers/notificationController");

router.post("/internal", internal);
router.get("/notifications", notifications);

module.exports = router;