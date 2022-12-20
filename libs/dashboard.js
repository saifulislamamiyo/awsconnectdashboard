/**
* connect:
*  getCampaignDashboardDataFromConnect
*  getAgentDashboardDataFromConnect
*/

/**
* ddb:
*  saveCampaignDashboardData
*  saveAgentDashboardData
*  loadCampaignDashboardData
*  loadAgentDashboardData
*/

/**
* Data acquisition 
*  setInterval(async ()=>{
*    await getCampaignDashboardDataFromConnect;
*    await saveCampaignDashboardData;
*    await getAgentDashboardDataFromConnect;
*    await saveAgentDashboardData;
*  }, dashboardDataAcquisitionInterval);
*/

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