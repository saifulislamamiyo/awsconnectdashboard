const { config } = require('dotenv');
const os = require('os');
config();

let pauseBetweenAPICallInServer = process.env.PAUSE_BETWEEN_API_CALL_IN_SERVER;
let pauseBetweenAPICallInClient = process.env.PAUSE_BETWEEN_API_CALL_IN_CLIENT;
let routingProfilePrefix = process.env.ROUTING_PROFILE_PREFIX;
let awsInstance = process.env.INSTANCE_ID;
let defaultOutboundQueueId = process.env.DEFAULT_OUTBOUND_QUEUE_ID;
let contactFlowId = process.env.CONTACT_FLOW_ID;
let logLevel = process.env.LOG_LEVEL;
let awsConfig;

if (os.hostname().indexOf("asifsmbp.local") > -1) {
  awsConfig = {
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
  };
} else {
  awsConfig = { region: process.env.REGION };
}

module.exports = {
  awsConfig,
  awsInstance,
  routingProfilePrefix,
  pauseBetweenAPICallInServer,
  pauseBetweenAPICallInClient,
  logLevel,
  defaultOutboundQueueId,
  contactFlowId
};
