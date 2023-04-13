const express = require('express');
const router = express.Router();
router.get("/", async (req, res, next) => {
  console.log("AUTH_DEBUG from Root '/' :", req.user)
  if (!req.user)  return res.render('login'); 
  let redirectRouteBasedOnUserType =  !req.user.admin ? '/agent-dashboard': '/campaigns';
  res.redirect (redirectRouteBasedOnUserType)
});
module.exports = router;