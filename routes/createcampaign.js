const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
var express = require('express');
var router = express.Router();
var connectClient = require('./connectclient')


router.get('/', async function (req, res, next) {
    var command;
    // command = new ListQueuesCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    // var campaigns = await connectClient.send(command);
    // console.log(campaigns.QueueSummaryList);
    command = new ListPhoneNumbersCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    var phoneNumbers = await connectClient.send(command);
    // console.log(phoneNumbers.PhoneNumberSummaryList);
    command = new ListHoursOfOperationsCommand({ InstanceId: process.env.CONNECT_INSTANCE_ID });
    var hoursOfOperations = await connectClient.send(command);
    // console.log(hoursOfOperations.HoursOfOperationSummaryList);
    res.render('createcampaign', {
        title: 'Create Campaign',
        phoneNumbers: phoneNumbers.PhoneNumberSummaryList,
        hoursOfOperations: hoursOfOperations.HoursOfOperationSummaryList,
        // campaigns: campaigns.QueueSummaryList,
    });
});


router.post('/', async function (req, res, next) {
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
    const command = new CreateQueueCommand(param);
    const respo = await connectClient.send(command);
    res.redirect("/")
});


router.get('/c', async function (req, res, next) {
    const command = new CreateQueueCommand({
        InstanceId: process.env.CONNECT_INSTANCE_ID,
        "Description": "Px-2 is a queue",
        "HoursOfOperationId": "b255a5e6-d7eb-4ebe-9a6d-f25394535874",
        "MaxContacts": 1,
        "Name": "Px-2",
        "OutboundCallerConfig": {
            "OutboundCallerIdNumberId": "bc9edeee-0073-4cee-bda5-47bdbac06e97",
        },


    });
    const respo = await connectClient.send(command);
    console.log(respo);
    res.redirect("/")
});
module.exports = router;
