const { pauseBetweenAPICallInClient } = require("../libs/configloader");
const express = require("express");
const router = express.Router();
const { getCampaigns, updateCampaignOfAgent } = require("../libs/ddbclient");

router.post("/", async (req, res, next) => {
  let agentName = req.user.username;
  let campaigns = [];
  if (req.body.assignedCampaign) {
    if (Array.isArray(req.body.assignedCampaign)) {
      for (let i = 0; i < req.body.assignedCampaign.length; i++) {
        let [campaignId, campaignName] = req.body.assignedCampaign[i].split(String.fromCharCode(28));
        console.log("}}}}}}}} ", req.body.assignedCampaign[i]);
        campaigns.push({ campaignId: campaignId, campaignName: campaignName });
      } // next i
    } else {
      console.log("}}}}}}}}>>>>>> ", req.body.assignedCampaign);
      let [campaignId, campaignName] = req.body.assignedCampaign.split(String.fromCharCode(28));
      campaigns.push({ campaignId: campaignId, campaignName: campaignName });
    } // end if Array.isArray(req.body.assignedCampaign
  }

  await updateCampaignOfAgent(agentName, campaigns);
  res.redirect('/agent-assign-campaign');
});

router.get("/", async (req, res, next) => {
  let agentName = req.user.username;
  console.log("Agent NAME: ", agentName)
  let campaigns = await getCampaigns();
  let agentsCampaigns = await getCampaigns(agentName);
  console.log(agentsCampaigns)
  res.render("agentassigncampaign", {
    title: "Campaign Self Assignment",
    campaigns: campaigns,
    agentsCampaigns: agentsCampaigns,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')

module.exports = router;
