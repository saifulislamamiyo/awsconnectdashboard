const { pauseBetweenAPICallInServer } = require("../libs/configloader");
const { modelAgent, modelCampaign } = require("../libs/ddbclient");
const { sleep } = require("../libs/utils");
const { logger } = require("../libs/logger");
const {
  getCampaigns,
  getAgents,
  getRoutingProfileId,
  getRoutingProfileName,
  getRoutingProfileCampaigns,
} = require("../libs/connectclient");

let initAgentDB = async () => {
  try {
    logger.info("Start: initAgentDB");
    let nextToken = "";
    do {
      let campaigns = await getCampaigns(nextToken);
      for (let campaign of campaigns.Queues) {
        let campaignItem = new modelCampaign({
          campaignName: campaign.Name,
          campaignId: campaign.QueueId,
          campaignStatus: (campaign.Status == "ENABLED" ? true : false),
          author: "default",
        });
        logger.info("Inserting: " + [
          campaign.Name,
          campaign.QueueId,
          (campaign.Status == "ENABLED" ? true : false)
        ].join(","));
        await campaignItem.save();
      }
      nextToken = campaigns.NextToken ?? "";
      if (nextToken != "") await sleep(pauseBetweenAPICallInServer);
    } while (nextToken != "");
    logger.info("End: initAgentDB");
  } catch (e) {
    logger.error(e.name + " - " + e.message);
  }
} // end initAgentDB()

let initCampaignDB = async () => {
  try {
    logger.info("Start: initCampaignDB");
    let agents = await getAgents();
    await sleep(pauseBetweenAPICallInServer);
    for (let [agentIndex, agent] of agents.entries()) {
      let routingProfileId = await getRoutingProfileId(agent.Id);
      if (agentIndex) await sleep(pauseBetweenAPICallInServer);
      let routingProfileName = await getRoutingProfileName(routingProfileId);
      await sleep(pauseBetweenAPICallInServer);
      let routingProfileCampaigns = await getRoutingProfileCampaigns(routingProfileId);
      let routingProfileCampaignsArr = [];
      for (let routingProfileCampaign of routingProfileCampaigns) {
        routingProfileCampaignsArr[routingProfileCampaignsArr.length] = {
          "campaignId": routingProfileCampaign.QueueId,
          "campaignName": routingProfileCampaign.QueueName
        };
      } // next routingProfileCampaign

      let agentItem = {
        agentName: agent.Username,
        agentId: agent.Id,
        routingProfileName: routingProfileName,
        routingProfileId: routingProfileId,
        campaigns: routingProfileCampaignsArr,
        author: 'default',
      }
      let agentModel = new modelAgent(agentItem);
      await agentModel.save();
      logger.info("Inserting: " + Object.values (agentItem));
    } // next agent
    logger.info("End: initCampaignDB");
  } catch (e) {
    logger.error(e.name + " - " + e.message);
  }
} // end initCampaignDB()


// // Run
initAgentDB();
initCampaignDB();
