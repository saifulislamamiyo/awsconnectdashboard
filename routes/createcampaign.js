const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const { awsConfig, awsInstance } = require('../libs/awsconfigloader');
const connectClient = require('../libs/connectclient')

const campaignForm = async (formData) => {
  const InstanceId = { InstanceId: awsInstance }
  let fromListPhoneNumbersCommand = (await connectClient.send(
    new ListPhoneNumbersCommand({ ...InstanceId })
  ));
  let phoneNumbers = [];
  fromListPhoneNumbersCommand.PhoneNumberSummaryList.forEach((item) => {
    phoneNumbers.push({ Id: item.Id, Name: item.PhoneNumber });
  });
  let hoursOfOperations = (await connectClient.send(
    new ListHoursOfOperationsCommand({ ...InstanceId })
  )).HoursOfOperationSummaryList;
  let allAgents = [
    { Id: '1', Name: 'John' }, { Id: '2', Name: 'Jane' },
    { Id: '3', Name: 'Chris' }, { Id: '4', Name: 'Pat' },
    { Id: '5', Name: 'Jake' }, { Id: '6', Name: 'Peter Pan' }
  ];
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
      agents: {
        type: "multiselect",
        label: "Agents",
        attr: "",
        data: formData.agents || [],
        data2: allAgents,
        error: '',
      },
    }
  };
  return form;
}

const cleanFormData = (formData) => {
  let cleanAgents;
  if (typeof formData.agents === 'undefined') cleanAgents = [];
  else if (typeof formData.agents === 'object') cleanAgents = formData.agents;
  else cleanAgents = [formData.agents]
  return {
    campaignName: String(formData.campaignName).trim() || "",
    campaignDescription: String(formData.campaignDescription).trim() || "",
    phoneNumber: String(formData.phoneNumber).trim() || "",
    hoursOfOperation: String(formData.hoursOfOperation).trim() || "",
    agents: cleanAgents,
  }
}

const validatedCampaignForm = async (formData) => {
  let cleanData = cleanFormData(formData);
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
    return res.render('createcampaign', { title: 'Create Campaign', form: form.form, });
  } else {
    req.flash('success', 'Campaign created successfully');
    res.redirect("/campaigns");
  }
});

module.exports = router;



//   let param = {
//       InstanceId: process.env.INSTANCE_ID,
//       Name: form.cleanData.campaignName,
//       Description: form.cleanData.campaignDescription,
//       HoursOfOperationId: form.cleanData.hoursOfOperation,
//       MaxContacts: 1,
//       OutboundCallerConfig: {
//           OutboundCallerIdNumberId: form.cleanData.phoneNumber,
//       }
//   }
// let command = new CreateQueueCommand(param);
// let respo = await connectClient.send(command);
