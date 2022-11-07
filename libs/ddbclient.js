const { awsConfig, routingProfilePrefix } = require("./configloader")
const dynamoose = require("dynamoose");
// const  {getConnectAgents}  = require("./connectclient");


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
    author: "default"
  });
  await newAgent.save();
} // end insertAgent()

module.exports = {
  modelCampaign,
  modelAgent,
  getCampaigns,
  setCampaignStatus,
  getUnprovisionedAgents,
  insertAgent,
};





/*
let test_it_create = async () => {
  try {
    let newAgent = new modelAgent({
      agentName: "agent.name.2",
      agentId: "agent-id-2",
      routingProfileName: "routing-profile-name-2",
      routingProfileId: "routing-profile-id-2",

      campaigns: [
        {
          campaignName: "camp-name-1",
          campaignId: "camp-id-1",
        },
        {
          campaignName: "camp-name-2",
          campaignId: "camp-id-2",
        },
        {
          campaignName: "camp-name-3",
          campaignId: "camp-id-3",
        },
      ],

      author: "default"
    });
    await newAgent.save();
  } catch (e) {
    console.log(e.name, e.message)
  }
};

let test_it_scan = async ()=>{
  try{
    let results = await modelAgent.scan().exec();
    console.log(results);
    console.log("-".repeat(10));
    console.log(results[0]);
    console.log("-".repeat(10));
    console.log(results[0].campaigns);
  }catch(e){
    console.log("-".repeat(10));
    console.log(e.name, e.message)
  }
}
*/
// test_it_create();
// test_it_scan();




