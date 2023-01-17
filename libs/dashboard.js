/**
* Imports
*/
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');
const { dashboardDataAcquisitionInterval, enableDashboardDataAcquisition } = require('./configloader');
const { logger } = require("./logger");
const { sleep } = require("./utils");
const {
  saveCampaignDashboardData,
  saveAgentDashboardData,
  loadCampaignDashboardData,
  loadAgentDashboardData,
  getLonelyContacts,
  saveContactCDR,
} = require('./ddbclient');
const {
  getCampaignDashboardDataFromConnect,
  getAgentDashboardDataFromConnect,
  getContactCDR,
} = require('./connectclient');

/**
* Functions
*/

const sendCampaignDashboard = async (io) => {
  let campaignDashboardData = await loadCampaignDashboardData()
  let agentDashboardData = await loadAgentDashboardData();
  io.emit('campaign-dashboard', { 'campaignData': campaignDashboardData, 'agentData': agentDashboardData });
}


/**
* Data acquisition
*/

/**
* Data acquisition TODO: 
* Remove getCampaignDashboardDataFromConnect and getAgentDashboardDataFromConnect from connectclient.js
* Implement getCampaignDashboardDataFromConnect and getAgentDashboardDataFromConnect in dashboard.js.
*
* getCampaignDashboardDataFromConnect:
*   getActiveCampaigns from DDB
*   getDashboardMetric from CONNECT
*   saveCampaignDashboardData in DDB
*
* getAgentDashboardDataFromConnect:
*   getActiveCampaigns from DDB
*   getAgentMetric from CONNECT
*   saveAgentDashboardData in DDB
*
* Acquisition interval flow will be like -
*
* if (enableDashboardDataAcquisition==1) {
*   setInterval(async () => {
*     await getCampaignDashboardDataFromConnect();
*     await getAgentDashboardDataFromConnect();
*   }, dashboardDataAcquisitionInterval);
* }
*
*
*/
if (enableDashboardDataAcquisition == 1) {
  setIntervalAsync(async () => {
    let data = await getCampaignDashboardDataFromConnect();
    await saveCampaignDashboardData(data);
    data = await getAgentDashboardDataFromConnect();
    await saveAgentDashboardData(data);
  }, parseInt(dashboardDataAcquisitionInterval));
}


if (1 == 1) {
  setIntervalAsync(async () => {
    logger.info("Getting latest ContactID(s) to retrieve details (CDR)");
    let contacts = await getLonelyContacts();
    for (n = 0; n < contacts.length; n++) {
      logger.info(`Retrieving CDR for contactId: ${contacts[n].contactId}`);
      let r = await getContactCDR(contacts[n].contactId);
      logger.info(r);
      if (r) {
        logger.info(`Saving CDR for contactId: ${contacts[n].contactId}`);
        await saveContactCDR(r);
      } else {
        await saveContactCDR({
          "contactId": contacts[n].contactId,
          "describeContactCalled": 2
        });
      }
      await sleep(500);
    }
  }, 1200000);
}


/** 
* Exports
*/

module.exports = {
  sendCampaignDashboard,
}