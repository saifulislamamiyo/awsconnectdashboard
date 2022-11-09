const {pauseBetweenAPICallInClient} = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const connect = require('../libs/connectclient');
const ddb = require("../libs/ddbclient");


router.get('/', async (req, res, next) => {
  let campaigns = await ddb.getCampaigns();
  res.render('campaigns', {
    title: 'Campaigns',
    campaigns: campaigns,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
});

router.get('/set-campaign-status', async (req, res, next) => {
  await ddb.setCampaignStatus(req.query.qname, req.query.status);
  await connect.setCampaignStatus(req.query.id, req.query.status);
  res.sendStatus(200);
});

module.exports = router;
