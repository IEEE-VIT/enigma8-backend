const router = require('express').Router();
const passport = require('passport');
require('../config/passport-google-setup')

//login
router.get('/', (req, res) => {
    res.send('login', {user:req.user})
});

//logout
router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.send('homepage');
})

//google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//google-redirect
router.get('/auth/google/redirect', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    console.log(req.user)
    res.send('logged in '+ req.user.displayName);
  }
);

module.exports = router;