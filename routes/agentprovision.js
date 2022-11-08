const { pauseBetweenAPICallInClient, routingProfilePrefix } = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const { getUnprovisionedAgents, insertAgent, getAgents: getAgentsFromDB } = require("../libs/ddbclient");
const { createUserDynamicRouteProfile, getAgents: getAgentsFromConnect, listRoutingProfiles } = require("../libs/connectclient");

router.get("/", async (req, res, next) => {

  let allAgentsFromDB = await getAgentsFromDB();
  let allAgentsFromConnect = await getAgentsFromConnect();
  let unprovisionedAgents = await getUnprovisionedAgents(allAgentsFromConnect);
  let provisionedAgents = allAgentsFromDB.filter(a => allAgentsFromConnect.map(b=>b.Id).includes(a.agentId));

  res.render("agentprovision", {
    title: "Agent Provision",
    unprovisionedAgents: unprovisionedAgents,
    provisionedAgents: provisionedAgents,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')


router.get("/provision-agent", async (req, res, next) => {
  let expectedRPName = routingProfilePrefix + req.query.agentid;
  try {
    let dynaProfile = await createUserDynamicRouteProfile(req.query.agentid, req.query.agentname);
    await insertAgent(
      dynaProfile.userName,
      dynaProfile.userId,
      dynaProfile.routingProfileName,
      dynaProfile.routingProfileId
    );
    res.json({ "message": "OK" });
  } catch (e) {
    if (e.name == "DuplicateResourceException") {
      let allRoutingProfiles = await listRoutingProfiles();
      for (let r = 0; r < allRoutingProfiles.length; r++) {
        if (allRoutingProfiles[r].Name = expectedRPName) {
          await insertAgent(req.query.agentname, req.query.agentid, allRoutingProfiles[r].Name, allRoutingProfiles[r].Id)
          res.json({ "message": "OK" });
          break;
        } // end if
      } // allRoutingProfiles[r]
    }
  } // catch
});// end router.get('/provision-agent')


router.get("/provision-agent-success", (req, res, next) => {
  req.flash("success", "Agents provisioned succesfully.");
  res.redirect("/agent-provision");
}); // router.get("/agent-provision")

module.exports = router;