const express = require('express');
const router = express.Router();
const { checkUserCred } = require('../libs/ddbclient');
const { logIn, logOut } = require('../libs/auth');

router.get('/login', async (req, res, next) => {
  res.render('login', {
    title: ' Connect Admin - Sign In',
    hide_navbar: 1,
    hide_sidemenu: 1
  });
});

router.post('/login', async (req, res, next) => {
  let usr = req.body.authUserName
  let pwd = req.body.authUserPassword
  let chekedUser = await checkUserCred(usr, pwd);
  if (chekedUser === false) {
    req.flash("danger", "Invalid Username or Password.");
    res.redirect('/auth/login');
  } else {
    logIn(req, chekedUser);
    req.flash("success", "Logged in succesfully.");
    if (req.session.admin == 1) {
      res.redirect('/');
    } else {
      res.redirect('/agent-dashboard');
    }
  }
});

router.get('/logout', async function (req, res, next) {
  logOut(req)
  req.flash("info", "Logged out succesfully.");
  // req.session.destroy();
  // req.session.isLoggedIn = 0;
  // req.session.username='';
  // req.session.admin=-1;
  res.redirect('/auth/login');
});

module.exports = router;