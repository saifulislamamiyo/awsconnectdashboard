/**
* Imports
*/
const { dashboardDataAcquisitionInterval, enableDashboardDataAcquisition } = require('./configloader');

const {
  saveCampaignDashboardData,
  saveAgentDashboardData,
  loadCampaignDashboardData,
  loadAgentDashboardData
} = require('./ddbclient');

const {
  getCampaignDashboardDataFromConnect,
  getAgentDashboardDataFromConnect,
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
if (enableDashboardDataAcquisition==1) {
  setInterval(async () => {
    let data = await getCampaignDashboardDataFromConnect();
    await saveCampaignDashboardData(data);
    data = await getAgentDashboardDataFromConnect();
    await saveAgentDashboardData(data);
  }, dashboardDataAcquisitionInterval);
}

/** 
* Exports
*/

module.exports = {
  sendCampaignDashboard,
}