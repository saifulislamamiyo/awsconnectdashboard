const {ConnectClient} = require("@aws-sdk/client-connect");
const  awsConfig  = require("./awsconfigloader")

const connectClient = new ConnectClient(awsConfig);

module.exports = connectClient;
