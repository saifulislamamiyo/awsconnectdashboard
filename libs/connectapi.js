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
}; // end getAgents()

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
  console.log(campaignId, campaignStatus);
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
    Description: dynamicRouteProfileName,
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
  // insert ddb
  await insertAgent(userName, userId, newRP.RoutingProfileName, newRP.RoutingProfileId);
};

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
};