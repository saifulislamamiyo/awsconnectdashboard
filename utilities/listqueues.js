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
} = require("@aws-sdk/client-connect");
const { listRoutingProfiles, getCampaigns, awsInstance } = require("../libs/configloader");
const { connectClient } = require("../libs/connectclient");

(async () => {
  let nextToken = "";
  let queues = [];
  do {
    let param = {
      InstanceId: awsInstance,
      SearchCriteria: {
        QueueTypeCondition: 'STANDARD',
      }
    };
    if (nextToken != "") param.NextToken = nextToken;
    let result = await connectClient.send(new SearchQueuesCommand(param));
    nextToken = result.NextToken ?? '';
    queues = queues.concat(result.Queues)
    if (nextToken != "") sleep(1000);
  } while (nextToken != "")
  
  for(const q of queues) {
    console.log(q.QueueId, q.Status, q.Name)
  }
})();