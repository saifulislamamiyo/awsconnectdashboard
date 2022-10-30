const {
  ListRoutingProfilesCommand,
  ListContactFlowsCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
  ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const { awsConfig, awsInstance } = require('../libs/awsconfigloader');
const { campaignModel } = require('../libs/dbmodels');
const { getStandardQueues } = require('../libs/utils');

const listCampaigns = async (req, res, next) => {
  let campList = await getStandardQueues();
  res.render('campaigns', { title: 'Campaigns', campaigns: campList });
}

router.get('/', listCampaigns);
router.get('/campaigns', listCampaigns);

router.get('/set-campaign-status', async (req, res, next) => {
  let response = (await connectClient.send(
    new UpdateQueueStatusCommand({
      InstanceId: awsInstance,
      QueueId: req.query.id,
      Status: (req.query.status=='true') ? 'ENABLED' : 'DISABLED',
    })));
  res.sendStatus(200);
});

module.exports = router;
