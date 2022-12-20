const {
  awsConfig,
  awsInstance,
  routingProfilePrefix,
  defaultOutboundQueueId,
  pauseBetweenAPICallInServer,
} = require("./configloader");

const { loggedInUser } = require("./auth");

const {sleep, getCurrentISODateOnly} = require("./utils");

const {
  ConnectClient,
  SearchQueuesCommand,
  ListUsersCommand,
  DescribeUserCommand,
  DescribeRoutingProfileCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
  CreateRoutingProfileCommand,
  ListRoutingProfilesCommand,
  UpdateUserRoutingProfileCommand,
  AssociateRoutingProfileQueuesCommand,
  DisassociateRoutingProfileQueuesCommand,
  CreateQueueCommand,
  ListPhoneNumbersCommand,
  ListHoursOfOperationsCommand,
  DescribeQueueCommand,
  UpdateQueueHoursOfOperationCommand,
  UpdateQueueOutboundCallerConfigCommand,
  AssociatePhoneNumberContactFlowCommand,
  DescribePhoneNumberCommand,
  GetMetricDataCommand,
  GetCurrentMetricDataCommand
} = require("@aws-sdk/client-connect");

const {logger} = require("./logger")


/** 
* Initi Connect
*/
const connectClient = new ConnectClient(awsConfig);

/**
* Functions
*/

// ----- dashboard starts ------
const getMetric = async (queueId) => {
  // time constants
  var MS_PER_MINUTE = 60000;
  var COEFF = 1000 * 60 * 5;
  var DURATIONINMINUTES = 23.80 * 60;
  // get start and end time
  var date = Date.now();
  var endTime = new Date(date);
  var startTime = new Date(endTime - DURATIONINMINUTES * MS_PER_MINUTE);
  var flooredStartTime = new Date(Math.floor(startTime.getTime() / COEFF) * COEFF)
  var flooredEndTime = new Date(Math.floor(endTime.getTime() / COEFF) * COEFF)
  logger.info(`Report StartTime:${flooredStartTime} Report EndTime:${flooredEndTime}`)

  let cmd = new GetMetricDataCommand({
    "InstanceId": awsInstance,
    "StartTime": flooredStartTime,
    "EndTime": flooredEndTime,
    "Filters": {
      "Queues": [queueId],
      "Channels": ["VOICE"]
    },
    "Groupings": [
      "QUEUE",
      "CHANNEL"
    ],
    "HistoricalMetrics": [
      {
        "Name": "AFTER_CONTACT_WORK_TIME",
        "Unit": "SECONDS",
        "Statistic": "AVG"
      },
      {
        "Name": "CONTACTS_QUEUED",
        "Unit": "COUNT",
        "Statistic": "SUM"
      },
      {
        "Name": "CONTACTS_HANDLED",
        "Unit": "COUNT",
        "Statistic": "SUM"
      },
      {
        "Name": "HANDLE_TIME",
        "Unit": "SECONDS",
        "Statistic": "AVG"
      },
    ]
  });


  try {
    let res_all = await connectClient.send(cmd);
    return res_all.MetricResults
  } catch (e) {
    console.log(e)
    return [];
  }
};


const randomIntBetween = (min, max) => {
  // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getAgentDashboardDataFromConnect = async()=>{
  let fakeData = {
    "recordId": "1",
    "available": String(randomIntBetween(5, 15)),
    "busy": String(randomIntBetween(5, 15)),
    "inCall": String(randomIntBetween(5, 15)),
    "unavailable": String(randomIntBetween(5, 15)),
    "reportDate": String(getCurrentISODateOnly()),
    "author": loggedInUser.userId
  };
  return fakeData;
}

const getCampaignDashboardDataFromConnect = async () => {
  let fakeCampaign = [
    {
      "campaignName": "Final Countdown",
      "campaignId": "044119d2-7b7f-4f3d-9712-ad097fefee70",
    },
    {
      "campaignName": "Candy sale",
      "campaignId": "f962c2af-817a-4771-830a-4e9bebf99de1",
    },
    {
      "campaignName": "Big sale",
      "campaignId": "9df4b001-4264-4ebb-a57d-d5404deefb5b",
    },
    {
      "campaignName": "Test Campaign 1",
      "campaignId": "ddad4dcc-d697-45f4-8578-d81094f3f9a5",
    },
    {
      "campaignName": "Test Campaign 2",
      "campaignId": "3da1457a-68eb-455b-9b1d-89e4ed77e7b3",
    },
  ];

  let fakeData = [];
  for (let i = 0; i < 5; i++) {
    fakeData[fakeData.length] = {
      "campaignName": fakeCampaign[i].campaignName,
      "campaignId": fakeCampaign[i].campaignId,
      "totalCall": String(randomIntBetween(50, 300)),
      "currentCall": String(randomIntBetween(0, 10)),
      "callWaiting": String(randomIntBetween(0, 10)),
      "agentInQueue": String(randomIntBetween(0, 10)),
      "avgHandlingTime": String(randomIntBetween(40, 300)),
      "avgTalkTime": String(randomIntBetween(40, 300)),
      "avgWrapUpTime": String(randomIntBetween(40, 300)),
      "reportDate": String(getCurrentISODateOnly()),
      "author": loggedInUser.userId
    };
  }
  return fakeData;
}


// ----- dashboard ends ------

const addPhoneNumberToContactFlow = async (phoneNumberId, contactFlowId) => {
  let cmd = new AssociatePhoneNumberContactFlowCommand({
    InstanceId: awsInstance,
    PhoneNumberId: phoneNumberId,
    ContactFlowId: contactFlowId,
  });
  try {
    console.log("Attempting addPhoneNumberToContactFlow- PhoneNumberId:", phoneNumberId, ", ContactFlowId:", contactFlowId);
    await connectClient.send(cmd);
  } catch (e) {
    console.log("Error: ", e.name, e.message);
    return null;
  }
} // end addPhoneNumberToContactFlow()

const getCampaignDetails = async (campaignId) => {
  let cmd = new DescribeQueueCommand({
    InstanceId: awsInstance,
    QueueId: campaignId
  });
  try {
    return (await connectClient.send(cmd)).Queue;
  } catch (e) {
    return [];
  }
};

const getHourOfOperations = async () => {
  let hoOps = (await connectClient.send(
    new ListHoursOfOperationsCommand({
      InstanceId: awsInstance
    })
  )).HoursOfOperationSummaryList;
  return hoOps;
}

const getPhoneNumbers = async () => {
  let phNums = (await connectClient.send(
    new ListPhoneNumbersCommand({
      InstanceId: awsInstance
    })
  )).PhoneNumberSummaryList;
  return phNums;
};


const getPhoneNumbersWithDesc = async () => {
  let phArr = [];
  let phNums = (await connectClient.send(
    new ListPhoneNumbersCommand({
      InstanceId: awsInstance
    })
  )).PhoneNumberSummaryList;

  for (let ph of phNums) {
    await sleep(pauseBetweenAPICallInServer);
    phDesc = (await connectClient.send(
      new DescribePhoneNumberCommand({
        InstanceId: awsInstance,
        PhoneNumberId: ph.Id
      })
    )).ClaimedPhoneNumberSummary.PhoneNumberDescription;
    phArr[phArr.length] = { "Id": ph.Id, "PhoneNumber": ph.PhoneNumber, "PhoneNumberDesc": phDesc };
  }
  // console.log(phNums);
  // console.log(phArr);
  return phArr;
};


const getCampaigns = async (nextToken = "") => {
  let queues = [];
  let param = {
    InstanceId: awsInstance,
    SearchCriteria: {
      QueueTypeCondition: 'STANDARD',
    }
  };
  if (nextToken != "") param.NextToken = nextToken;
  let result = await connectClient.send(new SearchQueuesCommand(param));
  return result;
} // end getCampaigns()


const getAgents = async () => {
  let agents = (await connectClient.send(new ListUsersCommand({
    InstanceId: awsInstance,
  }))).UserSummaryList;
  return agents;
} // end getAgents()



const getRoutingProfileId = async (userId) => {
  let routingProfileId = (await connectClient.send(
    new DescribeUserCommand({
      InstanceId: awsInstance,
      UserId: userId,
    })
  )).User.RoutingProfileId;
  return routingProfileId;
} // end getRoutingProfileId()

const getRoutingProfileName = async (routingProfileId) => {
  let routingProfileName = (await connectClient.send(
    new DescribeRoutingProfileCommand({
      InstanceId: awsInstance,
      RoutingProfileId: routingProfileId,
    })
  )).RoutingProfile.Name;
  return routingProfileName;
} // end getRoutingProfileName()

const getRoutingProfileCampaigns = async (routingProfileId) => {
  let routingProfileCampaigns = (await connectClient.send(
    new ListRoutingProfileQueuesCommand({
      InstanceId: awsInstance,
      RoutingProfileId: routingProfileId,
    })
  )).RoutingProfileQueueConfigSummaryList;
  return routingProfileCampaigns;
} // end getRoutingProfileCampaigns()

const setCampaignStatus = async (campaignId, campaignStatus) => {
  await connectClient.send(new UpdateQueueStatusCommand({
    InstanceId: awsInstance,
    QueueId: campaignId,
    Status: (campaignStatus == "true" ? 'ENABLED' : 'DISABLED'),
  }));
} // end setCampaignStatus();


const listRoutingProfiles = async () => {
  let agents = (await connectClient.send(new ListRoutingProfilesCommand({
    InstanceId: awsInstance,
  }))).RoutingProfileSummaryList;
  return agents;
} // end listRoutingProfile()

const createUserDynamicRouteProfile = async (userId, userName) => {
  let dynamicRouteProfileName = routingProfilePrefix + userId;
  let cmd = new CreateRoutingProfileCommand({
    InstanceId: awsInstance,
    Name: dynamicRouteProfileName,
    DefaultOutboundQueueId: defaultOutboundQueueId,
    Description: dynamicRouteProfileName + "_" + userName,
    MediaConcurrencies: [
      {
        Channel: "VOICE",
        Concurrency: 1,
      },
    ],
  }); // cmd

  let newRP = await connectClient.send(cmd);
  await sleep(pauseBetweenAPICallInServer)

  // assign the routing profile to the user/agent
  await connectClient.send(
    new UpdateUserRoutingProfileCommand({
      InstanceId: awsInstance,
      UserId: userId,
      RoutingProfileId: newRP.RoutingProfileId,
    })
  );

  return {
    userName: userName,
    userId: userId,
    routingProfileName: dynamicRouteProfileName,
    routingProfileId: newRP.RoutingProfileId
  }
}; // end createUserDynamicRouteProfile()


const setRoutingProfileQueue = async (routingProfileId, queueId, assoc) => {
  let cmd;
  if (assoc == "true") {
    cmd = new AssociateRoutingProfileQueuesCommand({
      InstanceId: awsInstance,
      RoutingProfileId: routingProfileId,
      QueueConfigs: [{
        Delay: 0,
        Priority: 1,
        QueueReference: {
          Channel: "VOICE",
          QueueId: queueId,
        },
      }],
    });
  } else {
    cmd = new DisassociateRoutingProfileQueuesCommand({
      InstanceId: awsInstance,
      RoutingProfileId: routingProfileId,
      QueueReferences: [{
        Channel: "VOICE",
        QueueId: queueId,
      }],
    });
  }
  await connectClient.send(cmd);
} // end setRoutingProfileQueue()


const createQueue = async (name, description, hoursOfOperationId, outboundCallerIdNumberId) => {
  let cmd = new CreateQueueCommand({
    InstanceId: awsInstance,
    "Name": name,
    "Description": description,
    "HoursOfOperationId": hoursOfOperationId,
    "OutboundCallerConfig": {
      "OutboundCallerIdNumberId": outboundCallerIdNumberId,
    }
  });
  let ret = await connectClient.send(cmd);
  return ret;
} // end createQueue()

const updateHourOfOperations = async (campaignId, hourOfOperation) => {
  await connectClient.send(new UpdateQueueHoursOfOperationCommand({
    InstanceId: awsInstance,
    QueueId: campaignId,
    HoursOfOperationId: hourOfOperation
  }));
} // end updateHourOfOperations()

const updateOutboundCallerIdNumberId = async (campaignId, phoneNumber) => {
  await connectClient.send(new UpdateQueueOutboundCallerConfigCommand({
    InstanceId: awsInstance,
    QueueId: campaignId,
    OutboundCallerConfig: {
      OutboundCallerIdNumberId: phoneNumber,
    }
  }));
} // end updateOutboundCallerIdNumberId()

module.exports = {
  connectClient,
  getCampaigns,
  getAgents,
  getRoutingProfileId,
  getRoutingProfileName,
  getRoutingProfileCampaigns,
  setCampaignStatus,
  createUserDynamicRouteProfile,
  listRoutingProfiles,
  setRoutingProfileQueue,
  getPhoneNumbers,
  getHourOfOperations,
  createQueue,
  getCampaignDetails,
  updateHourOfOperations,
  updateOutboundCallerIdNumberId,
  addPhoneNumberToContactFlow,
  getPhoneNumbersWithDesc,
  getMetric,
  getCampaignDashboardDataFromConnect,
  getAgentDashboardDataFromConnect,
};
