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
const {  getCampaigns, awsInstance } = require("../libs/configloader");
const { connectClient , listRoutingProfiles} = require("../libs/connectclient");

(async () => {
 let routingProfiles=await listRoutingProfiles()
  
 console.log("RoutingProfiles:");
  for(const r of routingProfiles) {
    console.log(r.Id, r.Name)
  }
})();


