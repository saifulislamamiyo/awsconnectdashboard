const { ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
var express = require('express');
var router = express.Router();
var connectClient = require('./connectclient')


router.get('/', async function (req, res, next) {
  const command = new ListQueuesCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
  const campaigns = await connectClient.send(command);
  console.log(campaigns.QueueSummaryList);
  res.render('campaigns', { title: 'Campaigns', campaigns: campaigns.QueueSummaryList });
});

module.exports = router;
