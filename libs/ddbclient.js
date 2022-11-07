const { awsConfig } = require("./awsconfigloader")
const dynamoose = require("dynamoose");

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
      "schema":{
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

const getCampaigns = async()=>{
  let campaigns = await modelCampaign.scan().exec();
  return campaigns;
} // end getCampaigns()

const setCampaignStatus = async(campaignName, campaignStatus) => {
  // let agentItem = await modelAgent.get({"campaignName": campaignName});
  // await modelAgent.update({"campaignName": "Is it", "campaignDescription": "test desc"}); 
  console.log(campaignName, campaignStatus);
  await modelCampaign.update({"campaignName": campaignName, "campaignStatus": (campaignStatus=='true'? true:false)});
  // console.log(agentItem);
  // agentItem.update({"campaignName": campaignName, "campaignStatus": (campaignStatus=='true'? true:false)});
} // end setCampaignStatus()

module.exports = { modelCampaign, modelAgent, getCampaigns, setCampaignStatus };





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




