const { config } = require('dotenv');
const os = require('os');
config();


let awsInstance = process.env.INSTANCE_ID
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
  awsConfig = { region: process.env.REGION}; 
}

module.exports = { awsConfig, awsInstance };
