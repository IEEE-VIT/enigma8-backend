const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController");

router.get("/leaderboards", gameController.getLeaderboard);

module.exports = router;
