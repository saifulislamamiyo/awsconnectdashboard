const { pauseBetweenAPICallInClient } = require("../libs/configloader");
const express = require("express");
const router = express.Router();
const { sleep } = require("../libs/utils");
const { getCampaigns, getAgents, addCampaignToAgent, removeCampaignFromAgent } = require("../libs/ddbclient");
const { setRoutingProfileQueue } = require("../libs/connectclient");



router.get("/", async (req, res, next) => {
  let campaigns = await getCampaigns();
  let agents = await getAgents();
  res.render("agentdistribution", {
    title: "Agent Distribution",
    campaigns: campaigns,
    agents: agents,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')

router.get("/agent-distribution-success", (req, res, next) => {
  req.flash("success", "Agents distributed succesfully.");
  res.redirect("/agent-distribution");
}); // router.get("/agent-distribution-success")

router.get('/distribute-agent', async (req, res, next) => {
  let routingProfileId = req.query.rpid;
  let campaignId = req.query.campaignid;
  let assoc = req.query.assoc;
  let agentName = req.query.agentname;
  let campaignName = req.query.campaignname;
  console.log(">>>||>>>", req.query);
  await setRoutingProfileQueue(routingProfileId, campaignId, assoc);
  if (assoc == "true") {
    await addCampaignToAgent(agentName, campaignName, campaignId);
  }
  else {
    await removeCampaignFromAgent(agentName, campaignName, campaignId);
  }
  res.json({ "message": "OK" });
});

module.exports = router;
