const { pauseBetweenAPICallInServer, pauseBetweenAPICallInClient } = require("../libs/configloader")
const {
  getPhoneNumbers,
  getHourOfOperations,
  getCampaignDetails,
  updateHourOfOperations,
  updateOutboundCallerIdNumberId,
} = require("../libs/connectclient");
const { updatedCampaign, getCampaignDescription } = require("../libs/ddbclient");
const { logger } = require("../libs/logger");
const { sleep } = require("../libs/utils");
const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
  let campaignName = req.query.campaignname;
  let campaignId = req.query.campaignid;
  let phoneNumbers = await getPhoneNumbers();
  await sleep(pauseBetweenAPICallInServer);
  let hoursOfOperations = await getHourOfOperations();
  await sleep(pauseBetweenAPICallInServer);
  let campaignDescription = await getCampaignDescription(campaignName);

  res.render("editcampaign", {
    title: "Edit Campaign",
    campaignId : campaignId,
    campaignName: campaignName,
    campaignDescription: campaignDescription,
    phoneNumbers: phoneNumbers,
    hoursOfOperations: hoursOfOperations,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')

router.get('/save-edited', async (req, res, next) => {
  let campaignName = req.query.campaignname;
  let campaignId = req.query.campaignid;
  let campaignDescription = req.query.campaigndescription;
  let phoneNumber = req.query.phonenumber;
  let hoursOfOperation = req.query.hoursofoperation;
  try {
    await updatedCampaign(campaignName, campaignDescription);
    await updateHourOfOperations(campaignId, hoursOfOperation);
    await updateOutboundCallerIdNumberId(campaignId, phoneNumber);
    res.json({ "message": "OK" });
  } catch (e) {
    console.log(e);
    res.json({ "message": "FAILED" });
  }
}); //router.get('/save-edited')

router.get('/edit-campaign-success', async (req, res, next) => {
  req.flash("success", "Campaign updated succesfully.");
  res.redirect("/campaigns");
}); // router.get('/create-campaign-success')

router.get('/edit-campaign-fail', async (req, res, next) => {
  req.flash("danger", "Campaign could not be updated succesfully.");
  res.redirect("/campaigns");
}); // router.get('/create-campaign-success')

module.exports = router;


/*
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
*/

