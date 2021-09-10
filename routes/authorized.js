const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  response(res,true,req.user.username,"This is an protected endpoint of user:")
  // res.send("" + req.user.username);
});

module.exports = router;
