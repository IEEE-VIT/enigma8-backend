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

router.get(
  "/web/apple", 
  passport.authenticate('apple')
);

router.post("/web/apple/redirect", function(req, res, next) {
  passport.authenticate('apple', function(err, user, info) {
      if (err) {
          if (err == "AuthorizationError") {
              res.send("Oops! Looks like you didn't allow the app to proceed. Please sign in again! <br /> \
              <a href=\"/login\">Sign in with Apple</a>");
          } else if (err == "TokenError") {
              res.send("Oops! Couldn't get a valid token from Apple's servers! <br /> \
              <a href=\"/login\">Sign in with Apple</a>");
          }
      } else {
          res.json(user);
      }
  })(req, res, next);
});

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

module.exports = router;
