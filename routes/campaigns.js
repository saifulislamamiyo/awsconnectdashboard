const { ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');

const listCampaigns = async (req, res, next) => {
  const command = new ListQueuesCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
  const campaigns = await connectClient.send(command);
  res.render('campaigns', { title: 'Campaigns', campaigns: campaigns.QueueSummaryList });
}

router.get('/', listCampaigns);
router.get('/campaigns', listCampaigns);

module.exports = router;
