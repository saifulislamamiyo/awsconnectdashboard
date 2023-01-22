const {pauseBetweenAPICallInClient} = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const {getCampaignMetric, getAgentMetric} = require('../libs/connectclient');
const {getCampaigns} = require("../libs/ddbclient");

/* GET home page. */
router.get('/', async (req, res, next) => {

  let allCampaigns = await getCampaigns();
  let arrCampaigns = [];

  for(let n=0;n<allCampaigns.length;n++){
    arrCampaigns[n] = allCampaigns[n].campaignId;
  }


  // let agentMetric = await getAgentMetric(arrCampaigns);
  let agentMetric = await getCampaignMetric(arrCampaigns);




  console.log(arrCampaigns);
  console.log(agentMetric);


  res.render('campaigndashboard', { title: 'Campaign Dashboard' });
});

module.exports = router;
