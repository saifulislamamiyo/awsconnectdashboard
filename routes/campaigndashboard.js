const {pauseBetweenAPICallInClient} = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const connect = require('../libs/connectclient');
const ddb = require("../libs/ddbclient");

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.render('campaigndashboard', { title: 'Campaign Dashboard' });
});

module.exports = router;
