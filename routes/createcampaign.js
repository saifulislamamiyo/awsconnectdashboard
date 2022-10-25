const { CreateQueueCommand, ListQueuesCommand, ListPhoneNumbersCommand, ListHoursOfOperationsCommand } = require("@aws-sdk/client-connect");
const express = require('express');
const router = express.Router();
const { awsConfig, awsInstance } = require('../libs/awsconfigloader');
const connectClient = require('../libs/connectclient')
const { campaignModel } = require('../libs/dbmodels');
const { asyncConLog } = require("../libs/utils");




const campaignForm = async (formData, form_for_update = false) => {
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
        attr: form_for_update ? "disabled" : "",
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
    status: true
  }
}

const validatedCampaignForm = async (formData) => {
  let cleanData = cleanFormData(formData);
  let form = await campaignForm(formData);
  let validationPassed = true;
  let campaignNameList = (await connectClient.send(
    new ListQueuesCommand({ InstanceId: awsInstance })
  ));
  let name_exist = false;
  if (campaignNameList.QueueSummaryList.some(e => e.Name === cleanData.campaignName)) {
    name_exist = true
  }

  if (cleanData.campaignName == "" || name_exist == true) {
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


let createQueue = async (cleanformData) => {
  let param = {
    InstanceId: awsInstance,
    Name: cleanformData.campaignName,
    Description: cleanformData.campaignDescription,
    HoursOfOperationId: cleanformData.hoursOfOperation,
    OutboundCallerConfig: {
      OutboundCallerIdNumberId: cleanformData.phoneNumber,
    }
  }

  let command = new CreateQueueCommand(param);
  let respo = await connectClient.send(command);

  return respo;
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
    try {
      // create queue in connect
      let ret = await createQueue(form.cleanData);
      // create queue in dynamo
      form.cleanData["id"] = ret.QueueId;
      ret = await campaignModel.create(form.cleanData);
      if (ret) {
        req.flash('success', 'Campaign created successfully');
        res.redirect("/campaigns");
      } else {
        req.flash('danger', 'Something went wrong. Please check inputs and internet connnection, and try again.');
        res.redirect("/create-campaign");
      }
    } catch (err) {
      req.flash('danger', 'Something went wrong. Please check inputs and internet connnection, and try again.');
      res.redirect("/create-campaign");
    }
  }
});

module.exports = router;
