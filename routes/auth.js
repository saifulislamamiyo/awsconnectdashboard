var express = require('express');
var passport = require('passport');
const { checkUserCred } = require('../libs/ddbclient');
var LocalStrategy = require('passport-local');

var router = express.Router();

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  console.log("AUTH_DEBUG: USER PWD POSTED)");
  let chekedUser = await checkUserCred(username, password);
  if (chekedUser === false) {
    console.log("AUTH_DEBUG: Invalid username or password");
    return cb(null, false, { message: 'Incorrect username or password.' });
  } else {
    console.log("AUTH_DEBUG: USER FOUND------------v");
    console.log(chekedUser, chekedUser.username, chekedUser.admin);
    console.log("AUTH_DEBUG: USER FOUND------------^");
    return cb(null, chekedUser);
  }
}));


passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { admin: user.admin, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});



router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


module.exports = router;