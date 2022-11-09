const { pauseBetweenAPICallInServer, pauseBetweenAPICallInClient } = require("../libs/configloader")
const { getPhoneNumbers, getHourOfOperations, createQueue } = require("../libs/connectclient");
const { insertCampaign, campaignExists } = require("../libs/ddbclient");
const { logger } = require("../libs/logger");



const { sleep } = require("../libs/utils");
const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
  let phoneNumbers = await getPhoneNumbers();
  await sleep(pauseBetweenAPICallInServer);
  let hoursOfOperations = await getHourOfOperations();
  return res.render('createcampaign', {
    title: 'Create Campaign',
    phoneNumbers: phoneNumbers,
    hoursOfOperations: hoursOfOperations,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // router.get('/')

router.get('/campaign-name-check', async (req, res, next) => {
  let isAvailable = await campaignExists(req.query.campaignname);
  res.json({ "available": isAvailable });
}); // router.get('/campaign-name-check')

router.get('/save-campaign', async (req, res, next) => {
  let name = req.query.name;
  let description = req.query.description;
  let hoursOfOperationId = req.query.hoursOfOperationId;
  let outboundCallerIdNumberId = req.query.outboundCallerIdNumberId;
  let connectResp;
  try {
    // create queue in connect
    connectResp = await createQueue(name, description, hoursOfOperationId, outboundCallerIdNumberId);
    await sleep(pauseBetweenAPICallInServer);
    // save campaign in campaignsDB
    await insertCampaign(name, connectResp.QueueId, true);
    res.json({ "message": "OK" });
  } catch (e) {
    console.log(e);
    if (e.name =="LimitExceededException") res.json({ "message": "LimitExceededException" });
    else res.json({ "message": "InternalServerError" });
  } // catch
}); // router.get('/save-campaign')

router.get('/create-campaign-success', async (req, res, next) => {
  req.flash("success", "Campaign created succesfully.");
  res.redirect("/campaigns");
}); // router.get('/create-campaign-success')

router.get('/create-campaign-fail', async (req, res, next) => {
  req.flash("danger", req.query.errtext);
  res.redirect("/campaigns");
}); // router.get('/create-campaign-fail')

module.exports = router;



/*
router.post('/', async (req, res, next) => {
  let form = await validatedCampaignForm(req.body);
  if (!form.validationPassed) {
    return res.render('createcampaign', { title: 'Create Campaign', form: form.form, });
  } else {
    try {
      // create queue in connect
      createQueue(form.cleanData).then((response) => {
        req.flash('success', 'Campaign created successfully');
        res.render('createcampaignsuccess', {
          title: 'Create Campaign',
        });
      }).catch((err) => {
        req.flash('danger', 'Something went wrong. Please check inputs and internet connnection, and try again.');
        res.redirect("/create-campaign");
      });
    } catch (err) {
      req.flash('danger', 'Something went wrong. Please check inputs and internet connnection, and try again.');
      res.redirect("/create-campaign");
    }
  }
});

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
}*/

