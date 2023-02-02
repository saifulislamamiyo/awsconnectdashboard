const bcrypt = require('bcrypt')
const { awsConfig, routingProfilePrefix } = require("./configloader");
const dynamoose = require("dynamoose");
const { defaultUser } = require("./auth");
const { logger } = require("./logger");
const { sleep, getCurrentISODateOnly } = require("./utils");
const ddb = new dynamoose.aws.ddb.DynamoDB(awsConfig);
dynamoose.aws.ddb.set(ddb);

/**
 * Schema
 */

const schemaUser = new dynamoose.Schema({
  username: {
    type: String,
    hashKey: true,
  },
  admin: Number,
  passwordHash: String,
});

const schemaCDRSet = new dynamoose.Schema({
  ContactID: {
    type: String,
    hashKey: true,
  },
  describeContactCalled: Number,
  initiationMethod: String,
  channel: String,
  queueId: String,
  agentId: String,
  connectedToAgentTimestamp: Number,
  enqueueTimestamp: Number,
  initiationTimestamp: Number,
  disconnectTimestamp: Number,
  lastUpdateTimestamp: Number,
  duration: Number,
});

const schemaCDRGet = new dynamoose.Schema({
  ContactID: {
    type: String,
    hashKey: true,
  },
  describeContactCalled: Number,
  initiationMethod: String,
  channel: String,
  queueId: String,
  agentId: String,
  connectedToAgentTimestamp: Number,
  enqueueTimestamp: Number,
  initiationTimestamp: Number,
  disconnectTimestamp: Number,
  lastUpdateTimestamp: Number,
  duration: Number,
  CallDirection: String,
  CustomerNumber: String,
  StartTime: String,
  DialedNumber: String,
  DialNumberDesc: String,
  DialedConnectNumber: String,
  AgentUserName: String,
  WrapUpAt: String,
});

const schemaAgentDashboard = new dynamoose.Schema(
  {
    recordId: {
      type: String,
      hashKey: true,
    },
    available: String,
    busy: String,
    inCall: String,
    unavailable: String,
    reportDate: String,
    author: String,
  },
  {
    timestamps: true,
  }
);

const schemaCampaignDashboard = new dynamoose.Schema(
  {
    campaignName: {
      type: String,
      hashKey: true,
    },
    reportDate: {
      type: String,
      rangeKey: true,
    },
    campaignId: String,
    totalCall: String,
    currentCall: String,
    callWaiting: String,
    agentInQueue: String,
    avgHandlingTime: String,
    avgTalkTime: String,
    avgWrapUpTime: String,
    author: String,
  },
  {
    timestamps: true,
  }
);

const schemaCampaign = new dynamoose.Schema(
  {
    campaignName: {
      type: String,
      hashKey: true,
    },
    campaignId: String,
    campaignDescription: String,
    campaignStatus: Boolean,
    author: String,
  },
  {
    timestamps: true,
  }
);

const schemaAgent = new dynamoose.Schema(
  {
    agentName: {
      type: String,
      hashKey: true,
    },
    agentId: String,
    routingProfileName: String,
    routingProfileId: String,
    campaigns: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            campaignName: String,
            campaignId: String,
          },
        },
      ],
    },
    author: String,
  },
  {
    timestamps: true,
  }
);

const schemaPhoneNumber = new dynamoose.Schema(
  {
    phoneNumber: {
      type: String,
      hashKey: true,
    },
    phoneNumberId: String,
    phoneNumberDesc: String,
    tollFreeNumber: String,
    campaignName: String,
    campaignId: String,
    author: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Models
 */

const modelCampaign = dynamoose.model(
  "Cloudcall_Campaign_Table",
  schemaCampaign
);
const modelAgent = dynamoose.model("Cloudcall_Agent_Table", schemaAgent);
const modelPhoneNumber = dynamoose.model(
  "Cloudcall_Phone_Number_Table",
  schemaPhoneNumber
);
const modelCampaignDashboard = dynamoose.model(
  "Cloudcall_Campaign_Dashboard_Table",
  schemaCampaignDashboard
);
const modelAgentDashboard = dynamoose.model(
  "Cloudcall_Agent_Dashboard_Table",
  schemaAgentDashboard
);
const modelCDRSet = dynamoose.model("CloudCall_CDR", schemaCDRSet);
const modelCDRGet = dynamoose.model("CloudCall_CDR", schemaCDRGet);
const modelUser = dynamoose.model("CloudCall_User", schemaUser);
/**
 * Functions
 */

const getFullCDR = async () => {

  // // off for try 4
  // let currentDateTime = new Date();
  // let startTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), 0, 0, 0, 0);
  // let startFromEpoch = startTime / 1000;

  // // try 1:
  // let contacts = await modelCDRGet.scan().where('describeContactCalled').eq(1).and().where('initiationTimestamp').ge(startFromEpoch).exec();

  // // try 2
  // let cnd = new dynamoose.Condition().where('describeContactCalled').eq(1).and().where('initiationTimestamp').ge(startFromEpoch);
  // let contacts = await modelCDRGet.scan(cnd).exec()
  
  // // try 3
  // let scanned = await modelCDRGet.scan().where('describeContactCalled').eq(1);
  // let contacts = await scanned.where('initiationTimestamp').gt(startFromEpoch).exec();

  // // try 4

  /*
  let currentDateTime = new Date();
  let offset = currentDateTime.getTimezoneOffset();
  currentDateTime = new Date(currentDateTime.getTime() - offset * 60 * 1000);
  let startTime = new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
    0,
    0,
    0,
    0
  );
  let startFromEpoch = startTime / 1000;
  
  */


  // Try 5
  /*
    let currentServerDateTime = new Date();
    let offset = 11; // Sydney Timezone GMT+11
    let currentSydneyDateTime  = new Date(currentServerDateTime.getTime() - offset * 60 * 1000);
    let currentSydneyMidNight = new Date(currentSydneyDateTime.getFullYear(),currentSydneyDateTime.getMonth(),currentSydneyDateTime.getDate(),0,0,0,0);
    let currentSydneyMidNightEpoch = currentSydneyMidNight.getTime() / 1000
    let startFromEpoch =currentSydneyMidNightEpoch;
    console.log("currentServerDateTime", currentServerDateTime);
    console.log("currentSydneyDateTime", currentSydneyDateTime);
    console.log("currentSydneyMidNight", currentSydneyMidNight);
    console.log("currentSydneyMidNightEpoch", currentSydneyMidNightEpoch);
    console.log("startFromEpoch:", startFromEpoch);
  */


  // // Try 6

  // var today = new Date();  // Returns UTC datetime
  // var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 1, 0);
  // var localoffset = -(today.getTimezoneOffset() / 60);
  // var destoffset = 11; // GMT+11 for Sydney
  // var offset = destoffset - localoffset;
  // var offsetMidnightDateTime = new Date(todayMidnight.getTime() + offset * 3600 * 1000);
  // var offsetMidnightDateTimeEpoch = offsetMidnightDateTime.getTime() / 1000;



  // // Try 7:

  /*
  let curServerDate = new Date();
  let curServerMidnight = new Date(curServerDate.getFullYear(), curServerDate.getMonth(), curServerDate.getDate(), 0, 0, 0, 0);
  let curServerMidnightEpoch = curServerMidnight.getTime()/1000;
  let curServerDateEpoch = curServerDate.getTime()/1000;
  console.log(curServerDateEpoch, curServerMidnightEpoch, curServerDateEpoch> curServerMidnightEpoch);
  */

  // // try 8
  // let currentDateTime = new Date();
  // let startTime = new Date(
  //   currentDateTime.getFullYear(),
  //   currentDateTime.getMonth(),
  //   currentDateTime.getDate(),
  //   0,
  //   0,
  //   0,
  //   0
  // );
  // let startFromEpoch = startTime / 1000;

  // Try 9

  let today = new Date();   // server datetime
  let localoffset = -(today.getTimezoneOffset() / 60); // server tz offset
  let destoffset = 11; // Sydney tz offset GMT+11
  let offset = destoffset - localoffset;
  let offsetDateTime = new Date(new Date().getTime() + offset * 3600 * 1000); // Sydney datetime
  let offsetDateTimetoUTCMidnightInMS = Date.UTC(offsetDateTime.getUTCFullYear(), offsetDateTime.getUTCMonth(), offsetDateTime.getUTCDate(), 0, 0, 0);
  let offsetDateTimetoUTCMidnight = offsetDateTimetoUTCMidnightInMS / 1000;
  console.log(`Server datetime: ${today}`);
  console.log(`Server TZ: ${localoffset}`);
  console.log(`Sydney TZ: ${destoffset}`);
  console.log(`Sydney time from Server time: ${offsetDateTime}`);
  console.log(`Sydney time to UTC Midnight EPOCH: ${offsetDateTimetoUTCMidnight}`);

  // --------------------------------------------------------
  let startFromEpoch = offsetDateTimetoUTCMidnight;
  // --------------------------------------------------------

  let noDateFilter = process.env.DEV_NO_DATE_FILTER || "0";

  let contacts;

  if (noDateFilter != "0") {
    console.log("NO Date Filter");
    contacts = await modelCDRGet.scan()
      .where("describeContactCalled")
      .eq(1)
      .exec();
  } else {
    console.log("{@_@} With Date Filter >=", startFromEpoch);
    contacts = await modelCDRGet.scan()
      .where("describeContactCalled")
      .eq(1)
      .and()
      .where("initiationTimestamp")
      .ge(startFromEpoch)
      .exec();
  }
  // 1674529013.135
  // 1674558001
  // for (c of contacts) {
  //   console.log('PX: ', c.ContactID, typeof c.initiationTimestamp, c.initiationTimestamp)
  // }

  return contacts;
};


const getLonelyContacts = async () => {
  let contacts = await modelCDRGet
    .scan()
    .where("describeContactCalled")
    .not()
    .exists()
    .exec();
  return contacts;
};

const saveContactCDR = async (cdr) => {
  try {
    let c = await modelCDRSet.update(cdr);
    return true;
  } catch (e) {
    logger.error(e.name ?? e.message ?? e);
    return false;
  }
};

const loadCampaignDashboardData = async () => {
  let campaignDashboardData = await modelCampaignDashboard
    .scan()
    .where("reportDate")
    .eq(getCurrentISODateOnly())
    .exec();
  return campaignDashboardData;
};

const loadAgentDashboardData = async () => {
  let agentDashboardData = await modelAgentDashboard.scan().exec();
  return agentDashboardData;
};

const saveAgentDashboardData = async (dashboardData) => {
  logger.info("Saving agent dashboard data.");
  let newAgentDashboard = new modelAgentDashboard(dashboardData);
  await newAgentDashboard.save();
  logger.info("Saving agent dashboard data completed.");
};

const saveCampaignDashboardData = async (dashboardData) => {
  logger.info("Saving campaign dashboard data.");
  for (data of dashboardData) {
    let newCampaignDashboard = new modelCampaignDashboard(data);
    await newCampaignDashboard.save();
  }
  logger.info("Saving campaign dashboard data completed.");
};

const getAgents = async () => {
  let agents = await modelAgent.scan().exec();
  return agents;
}; // end getAgents()

const getCampaigns = async () => {
  let campaigns = await modelCampaign.scan().exec();
  return campaigns;
}; // end getCampaigns()

const getActiveCampaigns = async () => {
  let campaigns = await modelCampaign
    .scan()
    .where("campaignStatus")
    .eq(true)
    .exec();
  let campObject = {};
  let campIdArr = [];
  for (let n = 0; n < campaigns.length; n++) {
    campObject[campaigns[n].campaignId] = campaigns[n].campaignName;
    campIdArr[campIdArr.length] = campaigns[n].campaignId;
  }
  return { details: campObject, summary: campIdArr };
}; // end getActiveCampaigns()

const setCampaignStatus = async (campaignName, campaignStatus) => {
  await modelCampaign.update({
    campaignName: campaignName,
    campaignStatus: campaignStatus == "true" ? true : false,
  });
}; // end setCampaignStatus()

const insertAgent = async (
  agentName,
  agentId,
  routingProfileName,
  routingProfileId
) => {
  let newAgent = new modelAgent({
    agentName: agentName,
    agentId: agentId,
    routingProfileName: routingProfileName,
    routingProfileId: routingProfileId,
    author: defaultUser.userId,
  });
  await newAgent.save();
}; // end insertAgent()

let addCampaignToAgent = async (agentName, campaignName, campaignId) => {
  let result = await modelAgent.get(agentName);
  let campaigns = result.campaigns ?? [];

  let newCampaign = { campaignName: campaignName, campaignId: campaignId };
  campaigns.push(newCampaign);

  await modelAgent.update({ agentName: agentName, campaigns: campaigns });
}; // end addCampaignToAgent()

let removeCampaignFromAgent = async (agentName, campaignName, campaignId) => {
  let result = await modelAgent.get(agentName);
  let campaigns = result.campaigns ?? [];
  let updatedCampaigns = [];
  for (let campaign of campaigns) {
    if (campaign.campaignName != campaignName) {
      updatedCampaigns[updatedCampaigns.length] = campaign;
    }
  } // next campaign
  await modelAgent.update({
    agentName: agentName,
    campaigns: updatedCampaigns,
  });
}; // end removeCampaignToAgent()

const campaignExists = async (campaignName) => {
  let result = await modelCampaign.get(campaignName);
  return result === undefined;
}; // end campaignExists()

const insertCampaign = async (
  campaignName,
  campaignId,
  campaignDesc,
  campaignStatus
) => {
  let campaignItem = new modelCampaign({
    campaignName: campaignName,
    campaignId: campaignId,
    campaignDescription: campaignDesc,
    campaignStatus: campaignStatus,
    author: defaultUser.userId,
  });
  await campaignItem.save();
}; // end insertCampaign()

const updatedCampaign = async (campaignName, campaignDescription) => {
  let camp = await modelCampaign.update({
    campaignName: campaignName,
    campaignDescription: campaignDescription,
  });
  return camp;
}; // end updatedCampaign()

const getCampaignDescription = async (campaignName) => {
  let camp = await modelCampaign.get(campaignName);
  return camp === undefined ? "" : camp.campaignDescription ?? "";
}; // end updatedCampaign()

const getPhoneNumberCampaignMap = async () => {
  let phoneCampMap = await modelPhoneNumber.scan().exec();
  return phoneCampMap;
}; // end getPhoneNumberCampaignMap()

let insertPhoneNumberCampaignMap = async (
  campaignId,
  campaignName,
  phoneNumberId,
  phoneNumber,
  phoneNumberDesc,
  tollFreeNumber
) => {
  let phoneNumberCampaignMapIItem = new modelPhoneNumber({
    phoneNumber: "+" + String(phoneNumber).trim(),
    phoneNumberId: phoneNumberId,
    phoneNumberDesc: phoneNumberDesc,
    tollFreeNumber: tollFreeNumber,
    campaignName: campaignName,
    campaignId: campaignId,
    author: defaultUser.userId,
  });
  await phoneNumberCampaignMapIItem.save();
}; // end insertPhoneNumberCampaignMap()



// -- user authentication [start]-----------------------------
const checkUserCred = async (userName, pwdPlain) => {
  let user = await modelUser.scan().where('username').eq(userName).exec();
  if (user.count) {
    let usr = user[0];
    let pwdMatched = bcrypt.compareSync(pwdPlain, usr.passwordHash);
    if (pwdMatched) {
      return {username: usr.username, admin: usr.admin}
    } else {
      return false
    }
  }
  else {
    return false;
  }
}
// -- user authentication [end]-----------------------------



module.exports = {
  modelCampaign,
  modelAgent,
  modelPhoneNumber,
  modelCampaignDashboard,
  modelAgentDashboard,
  modelCDRGet,
  modelCDRSet,
  modelUser,
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
  checkUserCred,
};
