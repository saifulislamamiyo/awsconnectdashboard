const {
  ListRoutingProfilesCommand,
  ListContactFlowsCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
  ListQueuesCommand, 
  ListPhoneNumbersCommand, 
  ListAgentStatusesCommand, 
  ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const { awsConfig, awsInstance } = require('../libs/awsconfigloader');
const { campaignModel } = require('../libs/dbmodels');
const { asyncConLog } = require("../libs/utils");




router.get('/', async(req, res, next)=>{
  let campaigns = await campaignModel.list()
  let agents = await connectClient.send(
    new ListUsersCommand({
      InstanceId: awsInstance
    })
  )
  agents = agents.UserSummaryList
  asyncConLog(agents)



  res.render('agentdistribution', {
    title:"Agent Distribution", 
    campaigns: campaigns,
    agents: agents
  });

  
});
module.exports = router;
