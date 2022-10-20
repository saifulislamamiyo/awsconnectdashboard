const { ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const {awsConfig, awsInstance} = require('../libs/awsconfigloader');

const listCampaigns = async (req, res, next) => {
  const command = new ListQueuesCommand({ InstanceId: awsInstance });
  const campaigns = await connectClient.send(command);
  res.render('campaigns', { title: 'Campaigns', campaigns: campaigns.QueueSummaryList });
}

router.get('/', listCampaigns);
router.get('/campaigns', listCampaigns);

module.exports = router;
