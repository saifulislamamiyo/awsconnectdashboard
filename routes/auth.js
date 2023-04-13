const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { checkUserCred, changeUserPassword } = require('../libs/ddbclient');
const LocalStrategy = require('passport-local');
const { passwordHashSaltRounds } = require("../libs/configloader");


const SALT_ROUNDS = passwordHashSaltRounds;
const router = express.Router();

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


passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { admin: user.admin, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
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

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



router.get('/change-password', function (req, res, next) {
  if (!req.user) { return res.redirect('/login'); }
  res.render('changepassword', { title: 'Change Password' });
});

router.post('/change-password', async function (req, res, next) {
  if (!req.user) { return res.redirect('/login'); }
  let newPassword = req.body.newPassword.trim();
  let verifyNewPassword = req.body.verifyNewPassword.trim();
  let validated = 1;

  if (!newPassword || !verifyNewPassword) {
    req.flash('danger', "Please enter both fields.");
    validated = 0;
  }

  if (validated && (newPassword.length<4 || newPassword.length>12)) {
    req.flash('danger', "Password must be of 4 to 12 characters long.");
    validated = 0;
  }

  if (validated && (newPassword != verifyNewPassword)) {
    req.flash('danger', "Password does not match. Please try again.");
    validated = 0;
  }

  if(validated) {
    try{
      let loggedInUser = req.user.username;
      let newHashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
      await changeUserPassword(loggedInUser, newHashedPassword);
      req.flash('success', "Password changed successfullly");
    }
    catch(e){
      req.flash('danger', "Could not change password. Please try again.");
    }
  }
  
  res.redirect('/change-password');
});


module.exports = router;