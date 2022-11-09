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
  let detailsFromConnect = await getCampaignDetails(campaignId);
  let campaignDescription = await getCampaignDescription(campaignName);

  res.render("editcampaign", {
    title: "Edit Campaign",
    campaignId: campaignId,
    campaignName: campaignName,
    campaignDescription: campaignDescription,
    phoneNumbers: phoneNumbers,
    hoursOfOperations: hoursOfOperations,
    selectedHoursOfOperation: detailsFromConnect.HoursOfOperationId,
    selectedphoneNumber: detailsFromConnect.OutboundCallerConfig.OutboundCallerIdNumberId,
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
