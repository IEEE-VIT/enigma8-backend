const express = require("express");
const router = express.Router();
const passport = require("passport");
const { response } = require("../config/responseSchema");
const verify = require("../controllers/authController");

//Google Auth for web
router.get(
  "/web/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/web/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/failed",
    session: false,
  }),
  function (req, res) {
    response(res, { JWT: req.user.jwt });
  }
);

//generates a JWT
router.post("/app/google", async (req, res) => {
  try {
    const jwt = await verify(req.body.id_token);
    response(res, { JWT: jwt });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

module.exports = router;
