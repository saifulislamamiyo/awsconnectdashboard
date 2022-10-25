const {config} = require('dotenv');
config();

const awsConfig = {
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
};

const awsInstance = process.env.INSTANCE_ID
const awsConnectMaxContacts = process.env.MAX_CONTACTS

module.exports = { awsConfig, awsInstance, awsConnectMaxContacts};
