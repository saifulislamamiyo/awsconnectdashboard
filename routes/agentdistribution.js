const express = require("express");
const router = express.Router();
const connectClient = require("../libs/connectclient");
const { awsInstance } = require("../libs/awsconfigloader");

const { getStandardQueues } = require("../libs/utils");
const {
  ListRoutingProfileQueuesCommand,
  DescribeUserCommand,
  ListUsersCommand,
  ListQueuesCommand,
  ListRoutingProfilesCommand,
  DescribeRoutingProfileCommand,
  CreateRoutingProfileCommand,
  UpdateUserRoutingProfileCommand,
  AssociateRoutingProfileQueuesCommand,
  DisassociateRoutingProfileQueuesCommand,
} = require("@aws-sdk/client-connect");

const getAgentDistributions = async () => {
  // retrieve all user
  // for each user, get routing profile
  // for each routing profile, get queues
  let agentDists = [];

  let users = (
    await connectClient.send(
      new ListUsersCommand({
        InstanceId: awsInstance,
      })
    )
  ).UserSummaryList;

  for (const user of users) {
    let userRoutingProfileId = (
      await connectClient.send(
        new DescribeUserCommand({
          InstanceId: awsInstance,
          UserId: user.Id,
        })
      )
    ).User.RoutingProfileId;

    let routingProfileQueues = (
      await connectClient.send(
        new ListRoutingProfileQueuesCommand({
          InstanceId: awsInstance,
          RoutingProfileId: userRoutingProfileId,
        })
      )
    ).RoutingProfileQueueConfigSummaryList;

    for (const queue of routingProfileQueues) {
      agentDists.push({
        AgentName: user.Username,
        AgentId: user.Id,
        RoutingProfileId: userRoutingProfileId,
        QueueId: queue.QueueId,
        QueueName: queue.QueueName,
      });
    }
  } // next user
  return agentDists;
};

const getRoutingProfileOfAgent = async (userId) => {
  let RoutingProfileId = (
    await connectClient.send(
      new DescribeUserCommand({
        InstanceId: awsInstance,
        UserId: userId,
      })
    )
  ).User.RoutingProfileId;

  let RoutingProfileName = (
    await connectClient.send(
      new DescribeRoutingProfileCommand({
        InstanceId: awsInstance,
        RoutingProfileId: RoutingProfileId,
      })
    )
  ).RoutingProfile.Name;

  return { RoutingProfileId, RoutingProfileName };
};

router.get("/", async (req, res, next) => {
  let agentDists = await getAgentDistributions();
  let campaigns = await getStandardQueues();
  // let campaigns = (
  //   await connectClient.send(new ListQueuesCommand({ InstanceId: awsInstance }))
  // ).QueueSummaryList;

  let agents = (
    await connectClient.send(
      new ListUsersCommand({
        InstanceId: awsInstance,
      })
    )
  ).UserSummaryList;

  res.render("agentdistribution", {
    title: "Agent Distribution",
    campaigns: campaigns,
    agents: agents,
    agentDists: agentDists,
  });
}); // end router.get('/')

router.post("/", async (req, res, next) => {
  let campaign = "";
  let agents = [];
  let agentsToRelease = [];
  let validated = true;
  if (typeof req.body.selCampaign == "undefined") {
    req.flash("danger", "No Campaign selected.");
    validated = false;
  } else {
    campaign = req.body.selCampaign;
  }

  if (typeof req.body.selMappedAgents === "undefined") {
    agents = [];
  } else if (typeof req.body.selMappedAgents === "object") {
    agents = req.body.selMappedAgents;
  } else {
    agents = [req.body.selMappedAgents];
  }

  if (req.body.txtMappedAgentsPrev != "") {
    let pevMapAgents = req.body.txtMappedAgentsPrev.split(";");
    for (prevMapAgent of pevMapAgents) {
      if (!agents.includes(prevMapAgent)) {
        agentsToRelease.push(prevMapAgent);
      }
    }
  }

  if (validated) {
    // Distribute agents
    // -------------------------------------------------------------------------
    // for each agent to add:
    //    check if he has a routing profile named <text>_<userId>
    //    if <text>_<userId> not available, create it
    //    update <text>_<userId> by appending queue to it
    //
    // for each agent to release:
    //    update <text>_<userId> by removing queue from it
    // ** checking if profile exist and creating if not exist is not necessary for removing.
    // ** agent must have <text>_<userId>, when adding to queue(i.e. campaign)
    // -------------------------------------------------------------------------
    // API:
    // DescribeUser -> to get routing profile Id of the user
    // DescribeRoutingProfile -> to get routing profile Name
    // UpdateUserRoutingProfile -> to assigns the specified routing profile to the specified user.
    // CreateRoutingProfile -> to create new routing profile with QueueIDs
    // UpdateRoutingProfileQueues -> to update existing routing profile with QueueIDs
    // -------------------------------------------------------------------------

    for (const agent of agents) {
      let routingProfileOfAgent = await getRoutingProfileOfAgent(agent);
      dynamicProfileName = "automated_rp_" + agent;
      if (routingProfileOfAgent.RoutingProfileName != dynamicProfileName) {
        // create routing profile dynamicProfileName
        let cmd = new CreateRoutingProfileCommand({
          InstanceId: awsInstance,
          Name: dynamicProfileName,
          DefaultOutboundQueueId: campaign,
          Description: dynamicProfileName,
          MediaConcurrencies: [
            {
              Channel: "VOICE",
              Concurrency: 1,
            },
          ],
        }); // cmd
        let newRP = await connectClient.send(cmd);
        routingProfileOfAgent.RoutingProfileId = newRP.RoutingProfileId;
        routingProfileOfAgent.RoutingProfileName = dynamicProfileName;
        // assign the routing profile to the user/agent
        await connectClient.send(
          new UpdateUserRoutingProfileCommand({
            InstanceId: awsInstance,
            UserId: agent,
            RoutingProfileId: routingProfileOfAgent.RoutingProfileId,
          })
        );
      } // end if RoutingProfileNameOfAgent != dynamicProfileName

      let assoCmd = new AssociateRoutingProfileQueuesCommand({
        InstanceId: awsInstance,
        RoutingProfileId: routingProfileOfAgent.RoutingProfileId,
        QueueConfigs: [
          {
            Delay: 0,
            Priority: 1,
            QueueReference: {
              Channel: "VOICE",
              QueueId: campaign,
            },
          },
        ],
      });

      await connectClient.send(assoCmd);
    } // next agent to add

    for (const agent of agentsToRelease) {
      let rp = await getRoutingProfileOfAgent(agent);
      let cmdDiss = new DisassociateRoutingProfileQueuesCommand({
        InstanceId: awsInstance,
        RoutingProfileId: rp.RoutingProfileId,
        QueueReferences: [
          {
            Channel: "VOICE",
            QueueId: campaign,
          },
        ],
      });
      await connectClient.send(cmdDiss);
    } // next agent to remove

    if (1) {
      req.flash("success", "Campaign updated succesfully.");
    } else {
      req.flash("danger", "Could not update Campaign. Please check inputs.");
    }
  } // end if validated

  res.redirect("/agent-distribution");
}); // end router.post('/')

module.exports = router;
