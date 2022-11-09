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
    await insertCampaign(name, connectResp.QueueId, description, true);
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
