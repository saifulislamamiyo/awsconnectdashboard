const {pauseBetweenAPICallInClient} = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const { getUnprovisionedAgents, insertAgent } = require("../libs/ddbclient");
const { createUserDynamicRouteProfile, getAgents } = require("../libs/connectclient");

router.get("/", async (req, res, next) => {
  let allAgentsFromConnect = await getAgents();
  let unprovisionedAgents = await getUnprovisionedAgents(allAgentsFromConnect);
  res.render("agentprovision", {
    title: "Agent Provision",
    unprovisionedAgents: unprovisionedAgents,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')


router.get("/provision-agent", async (req, res, next) => {
  let dynaProfile = await createUserDynamicRouteProfile(req.query.agentid, req.query.agentname);
  await insertAgent(
    dynaProfile.userName,
    dynaProfile.userId,
    dynaProfile.routingProfileName,
    dynaProfile.routingProfileId
  );
  res.json({ "message": "OK" });
});// end router.get('/provision-agent')


router.get("/provision-agent-success", (req, res, next) => {
  req.flash("success", "Agents provisioned succesfully.");
  res.redirect("/agent-provision");
}); // router.get("/agent-provision")

module.exports = router;