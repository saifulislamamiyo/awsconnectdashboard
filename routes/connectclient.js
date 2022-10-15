const {ConnectClient} = require("@aws-sdk/client-connect");
const dotenv = require('dotenv');
dotenv.config();

const client = new ConnectClient({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      },
});

module.exports = client;
