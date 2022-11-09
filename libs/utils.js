const sleep = ms => new Promise(r => setTimeout(r, ms));
module.exports = { sleep }

/*
// TODO: DELETE
const asyncConLog = async (val) => {
  console.log(val)
}
// TODO: DELETE
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

// TODO: DELETE
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
// TODO: DELETE
module.exports = { asyncConLog, getStandardQueues, sleep, getCampaigns }
*/