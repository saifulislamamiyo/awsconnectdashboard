const { ListQueuesCommand, ListPhoneNumbersCommand, ListAgentStatusesCommand, ListUsersCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const connectClient = require('../libs/connectclient');
const {awsConfig, awsInstance} = require('../libs/awsconfigloader');
const {campaignModel} = require('../libs/dbmodels');
const listCampaigns = async (req, res, next) => {
  let campList = await campaignModel.list();
  res.render('campaigns', { title: 'Campaigns', campaigns: campList });
}

router.get('/', listCampaigns);
router.get('/campaigns', listCampaigns);

module.exports = router;
