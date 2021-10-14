const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");

router.get("/unlockRoom", roomController.unlockRoom);

module.exports = router;