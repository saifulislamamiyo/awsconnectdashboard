const { pauseBetweenAPICallInClient } = require("../libs/configloader");
const express = require("express");
const router = express.Router();
const { getCampaigns, updateCampaignOfAgent, getAgentDetails, addCampaignToAgent, removeCampaignFromAgent } = require("../libs/ddbclient");
const { setRoutingProfileQueue } = require("../libs/connectclient");



router.get("/", async (req, res, next) => {
  let agentName = req.user.username;
  
  let campaigns = await getCampaigns();
  let agentsCampaigns = await getCampaigns(agentName);
  let agentDetails = await getAgentDetails(agentName)
  if(!agentsCampaigns) agentsCampaigns = []
  res.render("agentassigncampaign", {
    title: "Campaign Self Assignment",
    campaigns: campaigns,
    agentsCampaigns: agentsCampaigns,
    agentDetails: agentDetails,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')


router.get('/assign-campaign', async (req, res, next) => {
  let routingProfileId = req.query.rpid;
  let campaignId = req.query.campaignid;
  let assoc = req.query.assoc;
  let agentName = req.query.agentname;
  let campaignName = req.query.campaignname;
  
  await setRoutingProfileQueue(routingProfileId, campaignId, assoc);
  if (assoc == "true") {
    await addCampaignToAgent(agentName, campaignName, campaignId);
  }
  else {
    await removeCampaignFromAgent(agentName, campaignName, campaignId);
  }
  res.json({ "message": "OK" });
});

router.get('/agent-assign-campaign-success', async (req, res, next) => {
  req.flash("success", "Campaign Assignement succesful.");
  res.redirect("/agent-assign-campaign");
})

module.exports = router;
