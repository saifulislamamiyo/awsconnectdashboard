const express = require('express');
const router = express.Router();
const { getFullCDR, getAgents, getCampaigns } = require('../libs/ddbclient');
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
  // Get all CDR from CloudCall_CDR
  let fullCDR = await getFullCDR();

  // Get all campaigns from Cloudcall_Campaign_Table
  let campaigns = await getCampaigns();
  let arrCampaigns = [];
  for (let c of campaigns) {
    arrCampaigns[arrCampaigns.length] = {
      campaignName: c.campaignName,
      campaignId: c.campaignId
    }
  }
  // Get all agents from Cloudcall_Agent_Table
  let agents = await getAgents();
  let arrAgents = [];
  for (let a of agents) {
    arrAgents[arrAgents.length] = {
      agentName: a.agentName,
      agentId: a.agentId
    }
  }

  // make primary array of CDR (i.e primaryProcessedCDR) by processing values of CDR Array
  let primaryProcessedCDR = [];
  let primaryProcessedCDRCount = 0;
  for (let n = 0; n < fullCDR.length; n++) {
    // Current CDR in CDR Array
    theCDR = fullCDR[n];

    // If current CDR's queueID is unavailable, skip further processing
    // if (!theCDR.queueId) continue;

    // If current CDS's agentId does not mmatch with logged in agentId, skip further processing
    // if() continue;

    // Get campaignName from current CDR's queueId
    let arrCampaignsSearchVal = arrCampaigns.find(o => o.campaignId == theCDR.queueId);

    // Get agentName from current CDR's agentId
    let arrAgentsSearchVal = arrAgents.find(o => o.agentId == theCDR.agentId);

    // make primary array of CDR (i.e primaryProcessedCDR) by processing values of CDR Array
    primaryProcessedCDR[primaryProcessedCDRCount] = {
      agentName: arrAgentsSearchVal ? arrAgentsSearchVal.agentName : "",
      campaignName: arrCampaignsSearchVal ? arrCampaignsSearchVal.campaignName : "",
      callNumber: theCDR.DialedNumber,
      callDirection: theCDR.CallDirection,
      callStartTime: new Date(1000 * theCDR.initiationTimestamp).toLocaleString('en-us'),
      talkTime: theCDR.duration,
      waitTime: theCDR.enqueueTimestamp && theCDR.connectedToAgentTimestamp ? (theCDR.connectedToAgentTimestamp - theCDR.enqueueTimestamp) : 0,
      wrapTime: theCDR.WrapUpAt ? (theCDR.connectedToAgentTimestamp - theCDR.WrapUpAt) : 0,
      calls: theCDR.describeContactCalled,
      customerNumber: theCDR.CustomerNumber,
    }
    primaryProcessedCDRCount += 1;
  }

  let agentSummary = groupByWithSum(primaryProcessedCDR, 'agentName', 'talkTime, waitTime, wrapTime, calls')

  res.render('agentdashboard', {
    title: 'Agent Dashboard',
    agentSummary: agentSummary[0],
    allCDR: primaryProcessedCDR 
  });
});

module.exports = router;
