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
    res.redirect(
      `${process.env.FRONTEND_URL}googlesuccessfulAuth?token=${req.user.jwt}&isNew=${req.user.isNew}`
    );
  }
);

//generates a JWT
router.post("/app/google", async (req, res) => {
  try {
    const { jwt, isNew } = await verify.googleVerify(req.body.id_token);
    response(res, { JWT: jwt, isNew: isNew });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

router.post("/app/apple", async (req, res) => {
  try {
    const { jwt, isNew } = await verify.appleVerify(req.body.token);
    response(res, { JWT: jwt, isNew: isNew });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

router.post("/web/apple", async (req, res) => {
  try {
    const { jwt, isNew } = await verify.appleVerifyWeb(req.body.token);
    response(res, { JWT: jwt, isNew: isNew });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

module.exports = router;
