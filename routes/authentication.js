const express = require("express");
const router = express.Router();
const passport = require("passport");

const verify = require("../controllers/authController");
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

router.post("/generate_jwt_android_google", async (req, res) => {
  try {
    const jwt = await verify(req.body.id_token);
    res.json(jwt);
  } catch (err) {
    res.json({ error: "Please provide id_token in the request body" });
  }
});

module.exports = router;
