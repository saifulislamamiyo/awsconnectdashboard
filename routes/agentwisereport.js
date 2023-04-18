const express = require('express');
const router = express.Router();
const { getFullCDR, getAgents,getCampaigns } = require('../libs/ddbclient');
const { logger } = require('../libs/logger');
const groupBy = require('group-by-with');

const groupByWithSum = groupBy({
  rowCalculator: function (target, value, key) {
    target[key] = target[key] || 0;
    target[key] += (value || 0);
  }
});

/* GET home page. */
router.get('/', async (req, res, next) => {
  // agentName, campaignName, totalCalls, totalTalkTime, avgTalkTime
  let fullCDR = await getFullCDR();




  let aggCDR = groupByWithSum(fullCDR, 'agentId, queueId, CallDirection, WrapUpCode', 'describeContactCalled, duration');
  
  let agents = await getAgents();
  let arrAgents = [];
  for (let a of agents) {
    arrAgents[arrAgents.length] = {
      agentName: a.agentName,
      agentId: a.agentId
    }
  }

  let campaigns = await getCampaigns();
  let arrCampaigns = [];
  for(let c of campaigns){
    arrCampaigns[arrCampaigns.length] = {
      campaignName: c.campaignName,
      campaignId: c.campaignId
    }
  }


  for(let n=0;n<aggCDR.length;n++){
    let agentFiltered =  arrAgents.find(o => o.agentId == aggCDR[n].agentId)
    if (!agentFiltered) {
      aggCDR.splice(n,1);
      continue;
    }
    aggCDR[n].agentName = agentFiltered ? agentFiltered.agentName : "";
    let campNameFiltered = arrCampaigns.find(o => o.campaignId == aggCDR[n].queueId)
    campNameFiltered = campNameFiltered ? campNameFiltered.campaignName : '';
    aggCDR[n].campaignName = campNameFiltered;
  }



  // let cleanAggCDR = [];
  // let x = 0;
  // for(let n=0;n<aggCDR.length;n++){
  //   if(aggCDR[n].agentName) cleanAggCDR[x] = aggCDR[n];
  //   x++;
  // }



console.log(Object.keys(aggCDR))

  res.render('agentwisereport', { title: 'Agent Wise Report', aggCDR: aggCDR });
});

module.exports = router;
