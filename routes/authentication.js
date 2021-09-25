const express = require("express");
const router = express.Router();
const passport = require("passport");
const { response } = require("../config/responseSchema");
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
    response(res, { JWT: req.user.jwt });
  }
);

router.post("/generate_jwt_android_google", async (req, res) => {
  try {
    const jwt = await verify(req.body.id_token);
    response(res, { JWT: jwt });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

module.exports = router;
