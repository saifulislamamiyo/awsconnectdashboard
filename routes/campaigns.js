const { 
  ListRoutingProfilesCommand,
  ListContactFlowsCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
  ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const {awsConfig, awsInstance} = require('../libs/awsconfigloader');
const {campaignModel} = require('../libs/dbmodels');
// const { response } = require("express");






const listCampaigns = async (req, res, next) => {
  let campList = await campaignModel.list();
  res.render('campaigns', { title: 'Campaigns', campaigns: campList });
}

router.get('/', listCampaigns);
router.get('/campaigns', listCampaigns);

router.get('/set-campaign-status', async (req, res, next)=>{
    let response = (await connectClient.send(
    new UpdateQueueStatusCommand({ 
      InstanceId: awsInstance,
      QueueId: req.query.id,
      Status : (req.query.status)? 'ENABLED': 'DISABLED',
   })));
   console.log("[:", req.query.qname)
// TODO: UPDATE DATABASE
   await campaignModel.update({status:req.query.status}, req.query.qname )

  res.sendStatus(200);
});



const call_api = async () => {
  
  let response;

  // response = (await connectClient.send(
  //   new ListRoutingProfilesCommand({ 
  //     InstanceId: awsInstance
  //  })));

  //  response = (await connectClient.send(
  //   new ListRoutingProfileQueuesCommand({ 
  //     InstanceId: awsInstance,
  //     RoutingProfileId:'8fbeb2d8-a280-419f-a681-e04d0af7ffc1'
  //  })));

  // response = (await connectClient.send(
  //   new ListContactFlowsCommand({ 
  //     InstanceId: awsInstance
  //  })));

  response = (await connectClient.send(
    new ListQueuesCommand({ 
      InstanceId: awsInstance
   })));


  console.log(response)
}

// call_api()

module.exports = router;
