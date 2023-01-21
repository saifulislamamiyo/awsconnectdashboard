const express = require('express');
const router = express.Router();
const { getFullCDR, getCampaigns } = require('../libs/ddbclient');
const { logger } = require('../libs/logger');
const groupBy = require('group-by-with');

const groupByWithSum = groupBy({
  rowCalculator: function (target, value, key) {
    target[key] = target[key] || 0;
    target[key] += (value || 0);
  },
});

const groupByWithMax = groupBy({
  rowCalculator: function (target, value, key) {
    const normalized = Number(value);
    if (
      !isNaN(normalized) &&
      (target[key] === undefined || normalized > target[key])
    ) {
      target[key] = normalized;
    }
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

  // make primary array of CDR (i.e primaryProcessedCDR) by processing values of CDR Array
  let primaryProcessedCDR = [];
  let primaryProcessedCDRCount = 0;
  for (let n = 0; n < fullCDR.length; n++) {
    // Current CDR in CDR Array
    theCDR = fullCDR[n];
    // If current CDR's queueID is unavailable, skip further processing
    if (!theCDR.queueId) continue;
    // Get campaignName (i.e inboundGroupName) from current CDR's queueID
    let arrCampaignsSearchVal = arrCampaigns.find(o => o.campaignId == theCDR.queueId);
    // make primary array of CDR (i.e primaryProcessedCDR) by processing values of CDR Array
    primaryProcessedCDR[primaryProcessedCDRCount] = {
      inboundGroup: theCDR.DialedNumber,
      inboundGroupName: arrCampaignsSearchVal ? arrCampaignsSearchVal.campaignName : '',
      calls: parseInt(theCDR.describeContactCalled),
      disconnect: (theCDR.enqueueTimestamp && !theCDR.connectedToAgentTimestamp) ? 1 : 0,
      talkTime: theCDR.duration,
      waitTime: (theCDR.connectedToAgentTimestamp - theCDR.enqueueTimestamp),
    }
    primaryProcessedCDRCount += 1;
  }

  // Aggregate primaryProcessedCDR
  let primaryAggCDR = groupByWithSum(primaryProcessedCDR, 'inboundGroup, inboundGroupName', 'calls, disconnect, talkTime, waitTime');
  let primaryAggCDRForLongestWait = groupByWithMax(primaryProcessedCDR, 'inboundGroup, inboundGroupName', 'waitTime');

  // make final processed CDR for view
  secondaryProcessedCDR = [];
  for (let n = 0; n < primaryAggCDR.length; n++) {
    let theCDR = primaryAggCDR[n];
    let longestWaitTime = primaryAggCDRForLongestWait.find(o => o.inboundGroup == theCDR.inboundGroup);
    longestWaitTime = longestWaitTime ? longestWaitTime.waitTime : 0;
    secondaryProcessedCDR[n] = {
      inboundGroup: theCDR.inboundGroup,
      inboundGroupName: theCDR.inboundGroupName,
      calls: theCDR.calls,
      connects: theCDR.calls - theCDR.disconnect,
      disconnect: theCDR.disconnect,
      disconnectRate: 100 * theCDR.disconnect / theCDR.calls,
      talkTime: theCDR.talkTime,
      avgTalkTime: theCDR.talkTime / theCDR.calls,
      waitTime: theCDR.waitTime,
      avgWaitTime: theCDR.waitTime / theCDR.calls,
      longestWaitTime: longestWaitTime,
    };
  } // next primaryAggCDR

  // render view
  res.render('campaignwisereport', { title: 'Campaign Wise Report', aggCDR: secondaryProcessedCDR });
});

module.exports = router;
