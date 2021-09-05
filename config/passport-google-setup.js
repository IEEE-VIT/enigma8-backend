require('dotenv').config()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User= require('../models/user-model');

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID ,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/redirect',
  },
  function(accessToken, refreshToken, profile, cb) {

    // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user                                
                return cb(null,profile);
                
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,                    
                }).save().then((newUser) => {                    
                return cb(null,profile)
                });
            }
        });
    })
);

    // return cb(null, profile);
//   }
// ));