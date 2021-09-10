const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("This is an protected endpoint of user:" + req.user.username);
});

module.exports = router;
