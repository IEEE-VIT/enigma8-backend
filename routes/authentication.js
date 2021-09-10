const express = require("express");
const router = express.Router();
const passport = require("passport");

//Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/failed",
    session: false,
  }),
  function (req, res) {
    //console.log("TAG", req.user);
    res.json({ JWT: req.user.jwt });
  }
);

module.exports = router;
