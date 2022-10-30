const { awsInstance } = require("./awsconfigloader");
const connectClient = require("./connectclient");
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
  } while (nextToken != "")
  return queues;
}

module.exports = { asyncConLog, getStandardQueues }