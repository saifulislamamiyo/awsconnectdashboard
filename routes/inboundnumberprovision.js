const { pauseBetweenAPICallInClient, contactFlowId } = require("../libs/configloader");
const express = require("express");
const router = express.Router();
const { sleep } = require("../libs/utils");
const {
  getCampaigns,
  getPhoneNumberCampaignMap,
  insertPhoneNumberCampaignMap,
} = require("../libs/ddbclient");

const {
  getPhoneNumbersWithDesc,
  addPhoneNumberToContactFlow,
} = require("../libs/connectclient");



router.get("/", async (req, res, next) => {
  let campaigns = await getCampaigns();
  let phoneNumbersWithDesc = await getPhoneNumbersWithDesc();
  let phoneNumberCampaignMap = await getPhoneNumberCampaignMap();
  res.render("inboundnumberprovision", {
    title: "Inbound Number Provision",
    campaigns: campaigns,
    phoneNumbers: phoneNumbersWithDesc,
    phoneNumberCampaignMap: phoneNumberCampaignMap,
    pauseBetweenAPICallInClient: pauseBetweenAPICallInClient,
  });
}); // end router.get('/')

router.get("/inbound-number-provision-success", (req, res, next) => {
  req.flash("success", "Phone number provisioned succesfully.");
  res.redirect("/inbound-number-provision");
}); // router.get("/inbound-number-provision-success")

router.get('/inbound-number-provision-save', async (req, res, next) => {

  let campaignId = req.query.campaignid;
  let campaignName = req.query.campaignname;
  let phoneNumberId = req.query.phoneid;
  let phoneNumber = req.query.phoneNumber;

  await insertPhoneNumberCampaignMap(campaignId, campaignName, phoneNumberId, phoneNumber);
  if (campaignId != "") {
    await addPhoneNumberToContactFlow(phoneNumberId, contactFlowId);
  } else {
    console.log("Inbound Number UN-Provision operation. Escaping AssociatePhoneNumberContactFlowCommand API call.")
  }
  res.json({ "message": "OK" });
});

module.exports = router;
