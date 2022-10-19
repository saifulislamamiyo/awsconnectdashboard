const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();

const connectClient = require('../libs/connectclient')

const campaignForm = async (formData) => {
    const InstanceId = { InstanceId: process.env.CONNECT_INSTANCE_ID }

    let fromListPhoneNumbersCommand = (await connectClient.send(new ListPhoneNumbersCommand({...InstanceId})));
    let phoneNumbers = [];
    fromListPhoneNumbersCommand.PhoneNumberSummaryList.forEach((item)=>{
        phoneNumbers.push({Id:item.Id, Name:item.PhoneNumber});
    });

    let hoursOfOperations = (await connectClient.send(new ListHoursOfOperationsCommand({...InstanceId}))).HoursOfOperationSummaryList;
    
    let form =  {
        formName: "campaignForm",
        formMethod: "post",
        formAction: "/create-campaign",
        formFields: {
            campaignName: {
                type: "text",
                label: "Campaign Name",
                attr: "",
                data: formData.campaignName || "",
                error: '',
            },
            campaignDescription: {
                type: "text",
                label: "Campaign Description",
                attr: "",
                data: formData.campaignDescription||"",
                error: '',
            },
            phoneNumber: {
                type: "select",
                label: "Phone Number",
                attr: "",
                data: phoneNumbers,
                selected: "",
                error: '',
            },
            hoursOfOperation: {
                type: "select",
                label: "Hours of Operation",
                attr: "",
                data: hoursOfOperations,
                selected: formData.hoursOfOperation||"",
                error: '',
            },
        }
    };
    return form;
}


router.get('/', async (req, res, next) => {
    res.render('createcampaign', {
        title: 'Create Campaign',
        form: await campaignForm(req.body),
    });
});

router.post('/', async (req, res, next) => {
    console.log(
        req.body.campaignName,
        req.body.campaignDescription,
        req.body.phoneNumber,
        req.body.hoursOfOperation
    );

    param = {
        InstanceId: process.env.CONNECT_INSTANCE_ID,
        Name: req.body.campaignName,
        Description: req.body.campaignDescription,
        HoursOfOperationId: req.body.hoursOfOperation,
        MaxContacts: 1,
        OutboundCallerConfig: {
            OutboundCallerIdNumberId: req.body.phoneNumber,
        }
    }
    let command = new CreateQueueCommand(param);
    let respo = await connectClient.send(command);
    res.redirect("/")
});

module.exports = router;
