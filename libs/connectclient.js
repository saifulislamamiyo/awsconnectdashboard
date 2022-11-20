const {
  awsConfig,
  awsInstance,
  routingProfilePrefix,
  defaultOutboundQueueId,
  pauseBetweenAPICallInServer,
} = require("./configloader");

const { sleep } = require("./utils");

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
  AssociatePhoneNumberContactFlowCommand
} = require("@aws-sdk/client-connect");



const connectClient = new ConnectClient(awsConfig);

const addPhoneNumberToContactFlow = async (phoneNumberId, contactFlowId) => {
  let cmd = new AssociatePhoneNumberContactFlowCommand({
    InstanceId: awsInstance,
    PhoneNumberId: phoneNumberId,
    ContactFlowId: contactFlowId,
  });
  try {
    console.log("Attempting addPhoneNumberToContactFlow- PhoneNumberId:",phoneNumberId,", ContactFlowId:", contactFlowId);
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
};
