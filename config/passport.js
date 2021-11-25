const passport = require("passport");
const logger = require("../config/logger");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const AppleStrategy = require('passport-apple');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.TOKEN_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({ email: jwtPayload.email });

        done(null, user);
      } catch (error) {
        logger.error(err);
        done(null, false, { message: "invalid e-mail address or password" });
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/web/google/redirect",
    },
    function (accessToken, refreshToken, profile, cb) {
      // check if user already exists in our own db
      User.findOne({ email: profile._json.email }).then((currentUser) => {
        if (currentUser) {
          // already have this user
          profile.jwt = jwt.sign(
            { email: profile._json.email },
            process.env.TOKEN_SECRET
          );

          //if username exist
          profile.isNew = currentUser.username ? false : true;
          logger.info(
            `web/google user. isNew:${profile.isNew} username:${currentUser.username}`
          );
          return cb(null, profile);
        } else {
          // if not, create user in our db
          const jwtToken = jwt.sign(
            { email: profile._json.email },
            process.env.TOKEN_SECRET
          );
          new User({
            email: profile._json.email,
          })
            .save()
            .then((newUser) => {
              profile.jwt = jwtToken;
              profile.isNew = true;
              logger.info(
                `web/google user. isNew:${profile.isNew} username:${profile._json.email}`
              );
              return cb(null, profile);
            });
        }
      });
    }
  )
);

passport.use(
  new AppleStrategy
    (
      {
        clientID: "placeholder",
        teamID: "placeholder",
        callbackURL: "web/auth/web/apple/redirect",
        keyID: "placeholder",
        privateKeyLocation: "placeholder",
        passReqToCallback: true
      },
      function (req, accessToken, refreshToken, idToken, profile, cb) {
        profile = jwt.decode(idToken);
        User.findOne({ email: profile._json.email }).then((currentUser) => {
          if (currentUser) {
            // already have this user
            profile.jwt = jwt.sign(
              { email: profile._json.email },
              process.env.TOKEN_SECRET
            );

            //if username exist
            profile.isNew = currentUser.username ? false : true;
            logger.info(
              `web/apple user. isNew:${profile.isNew} username:${currentUser.username}`
            );
            return cb(null, profile);
          } else {
            // if not, create user in our db
            const jwtToken = jwt.sign(
              { email: profile._json.email },
              process.env.TOKEN_SECRET
            );
            new User({
              email: profile._json.email,
            })
              .save()
              .then((newUser) => {
                profile.jwt = jwtToken;
                profile.isNew = true;
                logger.info(
                  `web/apple user. isNew:${profile.isNew} username:${profile._json.email}`
                );
                return cb(null, profile);
              });
          }
        });
        // The idToken returned is encoded. You can use the jsonwebtoken library via jwt.decode(idToken)
        // to access the properties of the decoded idToken properties which contains the user's
        // identity information.
        // Here, check if the idToken.sub exists in your database!
        // idToken should contains email too if user authorized it but will not contain the name
        // `profile` parameter is REQUIRED for the sake of passport implementation
        // it should be profile in the future but apple hasn't implemented passing data
        // in access token yet https://developer.apple.com/documentation/sign_in_with_apple/tokenresponse
      }
    )
);
