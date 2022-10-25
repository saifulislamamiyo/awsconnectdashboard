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

call_api()

module.exports = router;
