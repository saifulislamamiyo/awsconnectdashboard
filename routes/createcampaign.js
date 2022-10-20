const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();

const connectClient = require('../libs/connectclient')

const campaignForm = async (formData) => {
  const InstanceId = { InstanceId: process.env.CONNECT_INSTANCE_ID }

  let fromListPhoneNumbersCommand = (await connectClient.send(new ListPhoneNumbersCommand({ ...InstanceId })));
  let phoneNumbers = [];
  fromListPhoneNumbersCommand.PhoneNumberSummaryList.forEach((item) => {
    phoneNumbers.push({ Id: item.Id, Name: item.PhoneNumber });
  });

  let hoursOfOperations = (await connectClient.send(new ListHoursOfOperationsCommand({ ...InstanceId }))).HoursOfOperationSummaryList;

  let form = {
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
        data: formData.campaignDescription || "",
        error: '',
      },
      phoneNumber: {
        type: "select",
        label: "Phone Number",
        attr: "",
        data: phoneNumbers,
        selected: formData.phoneNumber || "",
        error: '',
      },
      hoursOfOperation: {
        type: "select",
        label: "Hours of Operation",
        attr: "",
        data: hoursOfOperations,
        selected: formData.hoursOfOperation || "",
        error: '',
      },
    }
  };

  return form;
}

const validatedCampaignForm = async (formData) => {
  let cleanData = {
    campaignName: String(formData.campaignName).trim() || "",
    campaignDescription: String(formData.campaignDescription).trim() || "",
    phoneNumber: String(formData.phoneNumber).trim() || "",
    hoursOfOperation: String(formData.hoursOfOperation).trim() || "",
  }

  let form = await campaignForm(formData);

  let validationPassed = true;
  let campaignNameList = []
  if (cleanData.campaignName == "" || campaignNameList.includes(cleanData.campaignName)) {
    form.formFields.campaignName.error = "Unique Campaign Name is required.";
    validationPassed = false
  }
  if (cleanData.phoneNumber == "") {
    form.formFields.phoneNumber.error = "Phone Number is required.";
    validationPassed = false
  }
  if (cleanData.hoursOfOperation == "") {
    form.formFields.hoursOfOperation.error = "Hours of Operation is required.";
    validationPassed = false
  }
  return { form, cleanData, validationPassed };
}

router.get('/', async (req, res, next) => {
  return res.render('createcampaign', {
    title: 'Create Campaign',
    form: await campaignForm(req.body),
  });
});

router.post('/', async (req, res, next) => {

  let form = await validatedCampaignForm(req.body);

  if (!form.validationPassed) {
    return res.render('createcampaign', {
      title: 'Create Campaign',
      form: form.form,
    });
  } else {
    let param = {
        InstanceId: process.env.CONNECT_INSTANCE_ID,
        Name: form.cleanData.campaignName,
        Description: form.cleanData.campaignDescription,
        HoursOfOperationId: form.cleanData.hoursOfOperation,
        MaxContacts: 1,
        OutboundCallerConfig: {
            OutboundCallerIdNumberId: form.cleanData.phoneNumber,
        }
    }
    // let command = new CreateQueueCommand(param);
    // let respo = await connectClient.send(command);
    req.flash('success', 'Campaign created successfully')
    res.redirect("/campaigns");
  }

});

module.exports = router;
