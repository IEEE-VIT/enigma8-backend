const express = require("express");
const router = express.Router();
const passport = require("passport");
const response=require('../utils/responseButGeneric');

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
    // res.json({ JWT: req.user.jwt });
    response(res,true,req.user.jwt,"Logged in using Google!")
  }

);

router.get("/failed", async (req, res) => {
  response(res,false,"","Log in failed!")

});

module.exports = router;
