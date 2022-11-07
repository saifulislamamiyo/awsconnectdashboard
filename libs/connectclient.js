const { awsConfig, awsInstance } = require("./awsconfigloader");
const {
  ConnectClient,
  SearchQueuesCommand,
  ListUsersCommand,
  DescribeUserCommand,
  DescribeRoutingProfileCommand,
  ListRoutingProfileQueuesCommand,
  UpdateQueueStatusCommand,
} = require("@aws-sdk/client-connect");

const connectClient = new ConnectClient(awsConfig);

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

const setCampaignStatus = async(campaignId, campaignStatus) => {
  console.log(campaignId, campaignStatus);
   await connectClient.send(new UpdateQueueStatusCommand({
    InstanceId: awsInstance,
    QueueId: campaignId,
    Status: (campaignStatus == "true" ? 'ENABLED': 'DISABLED'),
  })); 
} // end setCampaignStatus();



module.exports = {
  connectClient,
  getCampaigns,
  getAgents,
  getRoutingProfileId,
  getRoutingProfileName,
  getRoutingProfileCampaigns,
  setCampaignStatus,
};
