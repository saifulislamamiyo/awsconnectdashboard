const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();

const connectClient = require('../libs/connectclient')

router.get('/', async  (req, res, next) =>{
    let command;
    // command = new ListQueuesCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    // let campaigns = await connectClient.send(command);
    // console.log(campaigns.QueueSummaryList);
    command = new ListPhoneNumbersCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    let phoneNumbers = await connectClient.send(command);
    // console.log(phoneNumbers.PhoneNumberSummaryList);
    command = new ListHoursOfOperationsCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    let hoursOfOperations = await connectClient.send(command);
    // console.log(hoursOfOperations.HoursOfOperationSummaryList);
    res.render('createcampaign', {
        title: 'Create Campaign',
        phoneNumbers: phoneNumbers.PhoneNumberSummaryList,
        hoursOfOperations: hoursOfOperations.HoursOfOperationSummaryList,
        // campaigns: campaigns.QueueSummaryList,
    });
});

router.post('/', async (req, res, next) =>{
    console.log(req.body.campaignName,
        req.body.campaignDescription,
        req.body.maxContacts,
        req.body.phoneNumber,
        req.body.hoursOfOperation
    );

    param = {
        InstanceId: process.env.CONNECT_INSTANCE_ID,
        Name: req.body.campaignName,
        Description: req.body.campaignDescription,
        HoursOfOperationId: req.body.hoursOfOperation,
        MaxContacts: parseInt(req.body.maxContacts),
        OutboundCallerConfig: {
            OutboundCallerIdNumberId: req.body.phoneNumber,
        }
    }
    let command = new CreateQueueCommand(param);
    let respo = await connectClient.send(command);
    res.redirect("/")
});

module.exports = router;
