const { awsConfig, routingProfilePrefix } = require("./configloader")
const dynamoose = require("dynamoose");
const { loggedInUser } = require("./auth");


const ddb = new dynamoose.aws.ddb.DynamoDB(awsConfig);
dynamoose.aws.ddb.set(ddb);

const schemaCampaign = new dynamoose.Schema({
  "campaignName": {
    "type": String,
    "hashKey": true
  },
  "campaignId": String,
  "campaignDescription": String,
  "campaignStatus": Boolean,
  "author": String,
}, {
  "timestamps": true,
});

const schemaAgent = new dynamoose.Schema({
  "agentName": {
    "type": String,
    "hashKey": true
  },
  "agentId": String,
  "routingProfileName": String,
  "routingProfileId": String,
  "campaigns": {
    "type": Array,
    "schema": [{
      "type": Object,
      "schema": {
        "campaignName": String,
        "campaignId": String,
      }
    }],
  },
  "author": String,
}, {
  "timestamps": true,
});

const schemaPhoneNumber = new dynamoose.Schema({
  "phoneNumber": {
    "type": String,
    "hashKey": true
  },
  "phoneNumberId": String,
  "campaignName": String,
  "campaignId": String,
  "author": String,
}, {
  "timestamps": true,
});

const modelCampaign = dynamoose.model("Cloudcall_Campaign_Table", schemaCampaign);
const modelAgent = dynamoose.model("Cloudcall_Agent_Table", schemaAgent);
const modelPhoneNumber = dynamoose.model("Cloudcall_Phone_Number_Table", schemaPhoneNumber);

const getAgents = async () => {
  let agents = await modelAgent.scan().exec();
  return agents;
} // end getAgents()

const getCampaigns = async () => {
  let campaigns = await modelCampaign.scan().exec();
  return campaigns;
} // end getCampaigns()

const setCampaignStatus = async (campaignName, campaignStatus) => {
  await modelCampaign.update({ "campaignName": campaignName, "campaignStatus": (campaignStatus == 'true' ? true : false) });
} // end setCampaignStatus()

const getUnprovisionedAgents = async (allAgentsFromConnect) => {
  let unprovisionedAgents = [];
  let allAgentsIdFromDB = [];
  let allAgentsFromDB = await modelAgent.scan().exec();

  for (let i = 0; i < allAgentsFromDB.length; i++) {
    allAgentsIdFromDB[allAgentsIdFromDB.length] = allAgentsFromDB[i].agentId;
    let dynaRPName = routingProfilePrefix + allAgentsFromDB[i].agentId;
    if (dynaRPName != allAgentsFromDB[i].routingProfileName) {
      unprovisionedAgents[unprovisionedAgents.length] = {
        agentName: allAgentsFromDB[i].agentName,
        agentId: allAgentsFromDB[i].agentId
      };
    }
  } // next allAgentsFromDB[i]

  for (let i = 0; i < allAgentsFromConnect.length; i++) {
    if (!allAgentsIdFromDB.includes(allAgentsFromConnect[i].Id)) {
      unprovisionedAgents[unprovisionedAgents.length] = {
        agentName: allAgentsFromConnect[i].Username,
        agentId: allAgentsFromConnect[i].Id
      };
    }
  } // next allAgentsFromConnect[i]

  return unprovisionedAgents;
} // end getUnprovisionedAgents()

const insertAgent = async (agentName, agentId, routingProfileName, routingProfileId) => {
  let newAgent = new modelAgent({
    agentName: agentName,
    agentId: agentId,
    routingProfileName: routingProfileName,
    routingProfileId: routingProfileId,
    author: loggedInUser.userId
  });
  await newAgent.save();
} // end insertAgent()

let addCampaignToAgent = async (agentName, campaignName, campaignId) => {
  let result = await modelAgent.get(agentName);
  let campaigns = result.campaigns ?? [];

  let newCampaign = { "campaignName": campaignName, "campaignId": campaignId }
  campaigns.push(newCampaign)

  await modelAgent.update({ "agentName": agentName, "campaigns": campaigns });
} // end addCampaignToAgent()

let removeCampaignFromAgent = async (agentName, campaignName, campaignId) => {
  let result = await modelAgent.get(agentName);
  let campaigns = result.campaigns ?? [];
  let updatedCampaigns = [];
  for (let campaign of campaigns) {
    if (campaign.campaignName != campaignName) {
      updatedCampaigns[updatedCampaigns.length] = campaign
    }
  } // next campaign
  await modelAgent.update({ "agentName": agentName, "campaigns": updatedCampaigns });
} // end removeCampaignToAgent()

const campaignExists = async (campaignName) => {
  let result = await modelCampaign.get(campaignName);
  return result === undefined;
} // end campaignExists()

const insertCampaign = async (campaignName, campaignId, campaignDesc, campaignStatus) => {
  let campaignItem = new modelCampaign({
    campaignName: campaignName,
    campaignId: campaignId,
    campaignDescription: campaignDesc,
    campaignStatus: campaignStatus,
    author: loggedInUser.userId
  });
  await campaignItem.save();
} // end insertCampaign()


const updatedCampaign = async (campaignName, campaignDescription) => {
  let camp = await modelCampaign.update({
    "campaignName": campaignName,
    "campaignDescription": campaignDescription
  });
  return camp;
} // end updatedCampaign()


const getCampaignDescription = async (campaignName) => {
  let camp = await modelCampaign.get(campaignName);
  return (camp === undefined ? "" : camp.campaignDescription ?? "");
} // end updatedCampaign()

const getPhoneNumberCampaignMap = async () => {
  let phoneCampMap = await modelPhoneNumber.scan().exec();
  return phoneCampMap;
}; // end getPhoneNumberCampaignMap()

let insertPhoneNumberCampaignMap = async (campaignId, campaignName, phoneNumberId, phoneNumber) => {
  let phoneNumberCampaignMapIItem = new modelPhoneNumber({
    phoneNumber: "+"+String(phoneNumber).trim(),
    phoneNumberId: phoneNumberId,
    campaignName: campaignName,
    campaignId: campaignId,
    author: loggedInUser.userId
  });
  await phoneNumberCampaignMapIItem.save();
}; // end insertPhoneNumberCampaignMap()

module.exports = {
  modelCampaign,
  modelAgent,
  modelPhoneNumber,
  getAgents,
  getCampaigns,
  setCampaignStatus,
  getUnprovisionedAgents,
  insertAgent,
  addCampaignToAgent,
  removeCampaignFromAgent,
  campaignExists,
  insertCampaign,
  updatedCampaign,
  getCampaignDescription,
  getPhoneNumberCampaignMap,
  insertPhoneNumberCampaignMap,
};

