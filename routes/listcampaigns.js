const {
  ListRoutingProfilesCommand,
  ListContactFlowsCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
  ListQueuesCommand,
  ListPhoneNumbersCommand,
  ListAgentStatusesCommand,
  DescribeUserCommand,
  ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const { awsConfig, awsInstance } = require('../libs/awsconfigloader');
const { campaignModel } = require('../libs/dbmodels');
const { asyncConLog } = require("../libs/utils");
// const { response } = require("express");









const call_api = async () => {

  let userSummaryList = (await connectClient.send(new ListUsersCommand({
    InstanceId: awsInstance
  }))).UserSummaryList;

  userSummaryList.forEach(async (user) => {
    
    let userRoutingProfileId = (await connectClient.send(new DescribeUserCommand({
      InstanceId: awsInstance,
      UserId: user.Id
    }))).User.RoutingProfileId;

    let routingProfileQueueConfigSummary = (await connectClient.send(new ListRoutingProfileQueuesCommand({
      InstanceId: awsInstance,
      RoutingProfileId: userRoutingProfileId,
    }))).RoutingProfileQueueConfigSummaryList;

    routingProfileQueueConfigSummary.forEach(async (routingProfile) => {
      // asyncConLog("----------------")
      // asyncConLog(routingProfile)
      console.log({Username: user.Username, UsernameId: user.Id, RoutingProfileId: userRoutingProfileId, RoutingProfileQueueId: routingProfile.QueueId, RoutingProfileQueueName:routingProfile.QueueName});
    });
  }); // next user

}

call_api()

module.exports = router;
