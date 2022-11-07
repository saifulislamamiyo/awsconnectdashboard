const { awsConfig, routingProfilePrefix } = require("./configloader")
const dynamoose = require("dynamoose");
const  {loggedInUser}  = require("./auth");


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

const modelCampaign = dynamoose.model("Cloudcall_Campaign_Table", schemaCampaign);
const modelAgent = dynamoose.model("Cloudcall_Agent_Table", schemaAgent);


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

  // let allAgentsFromConnect = await getConnectAgents();
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

module.exports = {
  modelCampaign,
  modelAgent,
  getAgents,
  getCampaigns,
  setCampaignStatus,
  getUnprovisionedAgents,
  insertAgent,
};

