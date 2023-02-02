const { pauseBetweenAPICallInClient, pauseBetweenAPICallInServer, routingProfilePrefix } = require("../libs/configloader");
const express = require('express');
const router = express.Router();
const { insertAgent,
  getAgents: getAgentsFromDB,
  modelAgent
} = require("../libs/ddbclient");

const {
  getRoutingProfileName,
  getRoutingProfileId,
  createUserDynamicRouteProfile,
  getAgents: getAgentsFromConnect,
  listRoutingProfiles
} = require("../libs/connectclient");
const { sleep } = require("../libs/utils");




const getUnprovisionedAgents = async (allAgentsFromConnect) => {
  let unprovisionedAgents = [];
  let allAgentsIdFromDB = [];
  let allAgentsFromDB = await getAgentsFromDB();

  for (let i = 0; i < allAgentsFromDB.length; i++) {
    // prepare all agents id array
    allAgentsIdFromDB[allAgentsIdFromDB.length] = allAgentsFromDB[i].agentId;
    // by convention get above agents dyna route profile
    let dynaRPName = routingProfilePrefix + allAgentsFromDB[i].agentId;

    // get routing profile name from connect
    let rpIdOfAgent = await getRoutingProfileId(allAgentsFromDB[i].agentId)
    await sleep(pauseBetweenAPICallInServer);
    let rpNameOfAgent = await getRoutingProfileName(rpIdOfAgent)

    // if above agent from db does not have dyna-route-profile, add him to unprovisioned array
    if (dynaRPName != rpNameOfAgent) {
      unprovisionedAgents[unprovisionedAgents.length] = {
        agentName: allAgentsFromDB[i].agentName,
        agentId: allAgentsFromDB[i].agentId
      };
    }
  } // next allAgentsFromDB[i]

  for (let i = 0; i < allAgentsFromConnect.length; i++) {
    // if an agent from connect does not exist in db, add him in unprovisioned array
    if (!allAgentsIdFromDB.includes(allAgentsFromConnect[i].Id)) {
      unprovisionedAgents[unprovisionedAgents.length] = {
        agentName: allAgentsFromConnect[i].Username,
        agentId: allAgentsFromConnect[i].Id
      };
    }
  } // next allAgentsFromConnect[i]

  return unprovisionedAgents;
} // end getUnprovisionedAgents()




router.get("/", async (req, res, next) => {
  let allAgentsFromConnect = await getAgentsFromConnect(); //UserSummaryList: Username, Id
  let provisionedAgents = await getAgentsFromDB(); // agentName, agentId
  let unprovisionedAgents = [];
  let provisionedAgentsId = provisionedAgents.map(b => b.agentId);

  for (let n = 0; n < allAgentsFromConnect.length; n++) {
    let idOfAgent = allAgentsFromConnect[n].Id;
    if (!provisionedAgentsId.includes(idOfAgent)) {
      unprovisionedAgents[unprovisionedAgents.length] = allAgentsFromConnect[n];
    }
  }

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
    console.log(e);
    if (e.name == "DuplicateResourceException") {
      console.log("Handling DuplicateResourceException");
      let allRoutingProfiles = await listRoutingProfiles(); // from connect
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