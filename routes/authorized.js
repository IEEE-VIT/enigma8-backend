const express = require("express");
const router = express.Router();
const { response } = require("../config/responseSchema");
router.get("/", async (req, res) => {
  response(res, {
    endpoint: "secured",
    username: req.user.username,
  });
});

module.exports = router;
