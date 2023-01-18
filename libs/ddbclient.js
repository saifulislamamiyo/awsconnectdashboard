const { awsConfig, routingProfilePrefix } = require("./configloader")
const dynamoose = require("dynamoose");
const { loggedInUser } = require("./auth");
const { logger } = require("./logger");
const { sleep, getCurrentISODateOnly } = require("./utils");
const { Connect } = require("@aws-sdk/client-connect");

const ddb = new dynamoose.aws.ddb.DynamoDB(awsConfig);
dynamoose.aws.ddb.set(ddb);

/**
 * Schema
 */


const schemaCDR = new dynamoose.Schema({
  "ContactID": {
    "type": String,
    "hashKey": true
  },
  "describeContactCalled": Number,
  "initiationMethod": String,
  "channel":String,
  "queueId": String,
  "agentId": String,
  "connectedToAgentTimestamp":Date,
  "enqueueTimestamp": Date,
  "initiationTimestamp": Date,
  "disconnectTimestamp": Date,
  "lastUpdateTimestamp": Date,
  "duration":Number,
});

const schemaAgentDashboard = new dynamoose.Schema({
  "recordId": {
    "type": String,
    "hashKey": true
  },
  "available": String,
  "busy": String,
  "inCall": String,
  "unavailable": String,
  "reportDate": String,
  "author": String,
}, {
  "timestamps": true,
});

const schemaCampaignDashboard = new dynamoose.Schema({
  "campaignName": {
    "type": String,
    "hashKey": true
  },
  "reportDate": {
    "type": String,
    "rangeKey": true
  },
  "campaignId": String,
  "totalCall": String,
  "currentCall": String,
  "callWaiting": String,
  "agentInQueue": String,
  "avgHandlingTime": String,
  "avgTalkTime": String,
  "avgWrapUpTime": String,
  "author": String,
}, {
  "timestamps": true,
});

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

/**
 * Models
 */

const modelCampaign = dynamoose.model("Cloudcall_Campaign_Table", schemaCampaign);
const modelAgent = dynamoose.model("Cloudcall_Agent_Table", schemaAgent);
const modelPhoneNumber = dynamoose.model("Cloudcall_Phone_Number_Table", schemaPhoneNumber);
const modelCampaignDashboard = dynamoose.model("Cloudcall_Campaign_Dashboard_Table", schemaCampaignDashboard);
const modelAgentDashboard = dynamoose.model("Cloudcall_Agent_Dashboard_Table", schemaAgentDashboard);
const modelCDR = dynamoose.model("CloudCall_CDR", schemaCDR);


/** 
 * Functions 
 */

const getFullCDR = async()=>{
  let currentDateTime = new Date();
  let startTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), 0, 0, 0, 0);
  let startFromEpoch = startTime / 1000;
  // // try 1:
  // let contacts = await modelCDR.scan().where('describeContactCalled').eq(1).and().where('initiationTimestamp').ge(startFromEpoch).exec();
  // // try 2
  // let cnd = new dynamoose.Condition().where('describeContactCalled').eq(1).and().where('initiationTimestamp').ge(startFromEpoch);
  // let contacts = await modelCDR.scan(cnd).exec()
  // // try 3

  let scanned = await modelCDR.scan().where('describeContactCalled').eq(1);
  let contacts = await scanned.where('initiationTimestamp').ge(startFromEpoch).exec();
  
  return contacts;
}


const getLonelyContacts = async()=>{
  let contacts = await modelCDR.scan().where("describeContactCalled").not().exists().exec();
  return contacts;
}

const saveContactCDR = async(cdr)=> {
  let c = new modelCDR(cdr);
  c.save()
}

const loadCampaignDashboardData = async () => {
  let campaignDashboardData = await modelCampaignDashboard.scan().where("reportDate").eq(getCurrentISODateOnly()).exec();
  return campaignDashboardData;
}
const loadAgentDashboardData = async () => {
  let agentDashboardData = await modelAgentDashboard.scan().exec();
  return agentDashboardData;
}

const saveAgentDashboardData = async (dashboardData) => {
  logger.info('Saving agent dashboard data.');
  let newAgentDashboard = new modelAgentDashboard(dashboardData);
  await newAgentDashboard.save();
  logger.info('Saving agent dashboard data completed.');
}

const saveCampaignDashboardData = async (dashboardData) => {
  logger.info('Saving campaign dashboard data.');
  for (data of dashboardData) {
    let newCampaignDashboard = new modelCampaignDashboard(data);
    await newCampaignDashboard.save();
  }
  logger.info('Saving campaign dashboard data completed.');
}


const getAgents = async () => {
  let agents = await modelAgent.scan().exec();
  return agents;
} // end getAgents()

const getCampaigns = async () => {
  let campaigns = await modelCampaign.scan().exec();
  return campaigns;
} // end getCampaigns()

const getActiveCampaigns = async () => {
  let campaigns = await modelCampaign.scan().where('campaignStatus').eq(true).exec();
  let campObject = {};
  let campIdArr = []
  for (let n = 0; n < campaigns.length; n++) {
    campObject[campaigns[n].campaignId] = campaigns[n].campaignName;
    campIdArr[campIdArr.length] = campaigns[n].campaignId;
  }
  return { 'details': campObject, 'summary': campIdArr };
} // end getActiveCampaigns()

const setCampaignStatus = async (campaignName, campaignStatus) => {
  await modelCampaign.update({ "campaignName": campaignName, "campaignStatus": (campaignStatus == 'true' ? true : false) });
} // end setCampaignStatus()


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
    phoneNumber: "+" + String(phoneNumber).trim(),
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
  modelCampaignDashboard,
  modelAgentDashboard,
  modelCDR,
  getAgents,
  getCampaigns,
  setCampaignStatus,
  insertAgent,
  addCampaignToAgent,
  removeCampaignFromAgent,
  campaignExists,
  insertCampaign,
  updatedCampaign,
  getCampaignDescription,
  getPhoneNumberCampaignMap,
  insertPhoneNumberCampaignMap,
  saveCampaignDashboardData,
  saveAgentDashboardData,
  loadCampaignDashboardData,
  loadAgentDashboardData,
  getActiveCampaigns,
  getLonelyContacts,
  saveContactCDR,
  getFullCDR,
};

