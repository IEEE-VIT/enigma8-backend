const express = require("express");
const router = express.Router();
const passport = require("passport");
const { response } = require("../config/responseSchema");
const auth = require("../controllers/authController");

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
    const { jwt, isNew } = await auth.verify(req.body.id_token);
    response(res, { JWT: jwt, isNew: isNew });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

router.get("/app/apple", async (req, res) => {
  try {
    const { grantCode } = await auth.validateApple(req.body.grantCode);
    response(res, { grantCode, isNew: isNew });
  } catch (err) {
    response(res, {}, 400, JSON.stringify(err), false);
  }
});

module.exports = router;
