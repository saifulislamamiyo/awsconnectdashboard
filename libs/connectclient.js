const { ConnectClient } = require("@aws-sdk/client-connect");
const { awsConfig } = require("./awsconfigloader");

const connectClient = new ConnectClient(awsConfig);
// const connectClient = new ConnectClient({ region: "ap-southeast-2" });

module.exports = connectClient;
