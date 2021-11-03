const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");

router.get("/checkIfRoomUnlocked", roomController.checkIfRoomUnlocked);
router.get("/allRooms", roomController.getRooms);

module.exports = router;