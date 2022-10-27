const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const {awsInstance } = require('../libs/awsconfigloader');
const {
  ListRoutingProfileQueuesCommand,
  DescribeUserCommand,
  ListUsersCommand,
  ListQueuesCommand,
  ListRoutingProfilesCommand,
  DescribeRoutingProfile,
} = require("@aws-sdk/client-connect");


const getAgentDistributions = async () => {
  // retrieve all user
  // for each user, get routing profile
  // for each routing profile, get queues
  let agentDists = [];

  let users = (await connectClient.send(new ListUsersCommand({
    InstanceId: awsInstance
  }))).UserSummaryList;

  for (const user of users) {
    let userRoutingProfileId = (await connectClient.send(
      new DescribeUserCommand({
        InstanceId: awsInstance,
        UserId: user.Id
      })
    )).User.RoutingProfileId;

    let routingProfileQueues = (await connectClient.send(
      new ListRoutingProfileQueuesCommand({
        InstanceId: awsInstance,
        RoutingProfileId: userRoutingProfileId,
      })
    )).RoutingProfileQueueConfigSummaryList;

    for (const queue of routingProfileQueues) {
      agentDists.push({ AgentName: user.Username, AgentId: user.Id, RoutingProfileId: userRoutingProfileId, QueueId: queue.QueueId, QueueName: queue.QueueName })
    }
  }; // next user
  return agentDists;
}

router.get('/', async (req, res, next) => {
  let agentDists = await getAgentDistributions()
  let campaigns = (await connectClient.send(
    new ListQueuesCommand({ InstanceId: awsInstance }))
  ).QueueSummaryList;

  let agents = (await connectClient.send(
    new ListUsersCommand({
      InstanceId: awsInstance
    })
  )).UserSummaryList;

  res.render('agentdistribution', {
    title: "Agent Distribution",
    campaigns: campaigns,
    agents: agents,
    agentDists: agentDists,
  });
}); // end router.get('/')

router.post('/', async (req, res, next) => {
  let campaign = "";
  let agents = [];
  let validated = true;
  if (typeof req.body.selCampaign == 'undefined') {
    req.flash('danger', 'No Campaign selected.');
    validated = false
  } else {
    campaign = req.body.selCampaign;
  }

  if (typeof req.body.selMappedAgents === 'undefined') {
    agents = [];
  } else if (typeof req.body.selMappedAgents === 'object') {
    agents = req.body.selMappedAgents;
  } else {
    agents = [req.body.selMappedAgents]
  }

  if(validated) {
    // Distribute agents 
    // -------------------------------------------------------------------------
    // for each agent to add:
    //    check if he has a routing profile named profile_<userId>
    //    if profile_<userId> not available, create it
    //    update profile_<userId> by appending queue to it
    // 
    // for each agent to release:
    //    update profile_<userId> by removing queue from it
    // -------------------------------------------------------------------------
    // API:
    // DescribeUser -> to get routing profile Id of the user
    // DescribeRoutingProfile -> to get routing profile Name
    // UpdateUserRoutingProfile -> to assigns the specified routing profile to the specified user. 
    // CreateRoutingProfile -> to create new routing profile with QueueIDs
    // UpdateRoutingProfileQueues -> to update existing routing profile with QueueIDs
    // -------------------------------------------------------------------------

    for (const agent of agents){
      // console.log(agent)
    }
    for (const agent of agentsToRelease){
      // console.log(agent)
    }

    if(1){
      req.flash('success', 'Campaign updated succesfully.');
    } else {
      req.flash('danger', 'Could not update Campaign. Please check inputs.');
    }
  } // end if validated

  res.redirect("/agent-distribution");
}); // end router.post('/')

module.exports = router;