const { awsInstance } = require("./awsconfigloader");
const connectClient = require("./connectclient");
const sleep = require('util').promisify(setTimeout)
const {
  SearchQueuesCommand,
} = require("@aws-sdk/client-connect");

const asyncConLog = async (val) => {
  console.log(val)
}

const getStandardQueues = async () => {
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
    if (nextToken != "") sleep(2000);
  } while (nextToken != "")
  return queues;
}


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
}

module.exports = { asyncConLog, getStandardQueues, sleep, getCampaigns }