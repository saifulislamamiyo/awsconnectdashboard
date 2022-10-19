const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const {ExecuteStatementCommand} = require( "@aws-sdk/client-dynamodb");
const  awsConfig  = require("./awsconfigloader")

const ddbClient = new DynamoDBClient(awsConfig);


/*

// Configure translator if required

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);

*/

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);


module.export = { ddbClient, ddbDocClient };


/*

// test db connection by running a PartiQL

const test_db_connectuon = async () => {
    try {
        const params = {
            Statement: "SELECT * FROM CloudCall_Campaign_Table",
            // Parameters: [],
        };
        const data = await ddbDocClient.send(
            new ExecuteStatementCommand(params)
        );
        for (let i = 0; i < data.Items.length; i++) {
            console.log(data.Items[i]);
        }
    } catch (err) {
        console.log(err);
    }

}
test_db_connectuon()
*/