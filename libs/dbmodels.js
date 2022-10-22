const { ExecuteStatementCommand } = require("@aws-sdk/client-dynamodb");
const { awsConfig, awsInstance } = require("./awsconfigloader")
const { ddbClient, ddbDocClient } = require('./ddbclient')
const { asyncConLog } = require('./utils');

const campaignModel = {
  _mapData: async (items) => {
    let mappedData = items.map(item => ({
      campaign_name: ('campaign_name' in item) ? item.campaign_name.S : "",
      id: ('id' in item) ? item.id.S : "",
      status: ('status' in item) ? item.status.BOOL : false,
      agents: ('agents' in item) ? item.agents.L : [],
      phone_number_id: ('phone_number_id' in item) ? item.phone_number_id.S : "",
      hours_of_operation_id: ('hours_of_operation_id' in item) ? item.hours_of_operation_id.S : "",
      created_at: ('created_at' in item) ? item.created_at.S : "",
      modified_at: ('modified_at' in item) ? item.modified_at.S : "",
      author: ('author' in item) ? item.author.S : "",
    }));
    return mappedData;
  },
  list: async () => {
    const data = await ddbDocClient.send(
      new ExecuteStatementCommand({
        Statement: "SELECT * FROM CloudCall_Campaign_Table",
        Parameters: null
      })
    );
    if (!data.Items.length) return [];
    mappedData = campaignModel._mapData(data.Items);
    return mappedData;
  },
  search: async (needle) => {
    if (typeof needle != 'string' || needle == "") return [];
    const data = await ddbDocClient.send(
      new ExecuteStatementCommand({
        Statement: "SELECT * FROM CloudCall_Campaign_Table where campaign_name=? or id=?",
        Parameters: [{ S: needle }, { S: needle }],
      })
    );
    if (!data.Items.length) return [];
    mappedData = campaignModel._mapData(data.Items);
    return mappedData;
  },
  create: async (items) => {
    if (typeof items != 'object') return false;
    const data = await ddbDocClient.send(
      new ExecuteStatementCommand({
        Statement: "INSERT INTO CloudCall_Campaign_Table value {'campaign_name':?, 'id':?, 'status':?, 'agents':?, 'phone_number_id':?, 'hours_of_operation_id':?, 'created_at':?, 'modified_at':?, 'author':?}",
        Parameters: [{ S: items.campaign_name || '' }, { S: items.id || '' }, { BOOL: items.status || false }, { L: items.agents || [] }, { S: items.phone_number_id || '' }, { S: items.hours_of_operation_id || '' }, { S: items.created_at || '' }, { S: items.modified_at || '' }, { S: items.author || '' } ],
      })
    );
    return true;
  },
  update: async (items, campaign_name) => {
    if (typeof items != 'object') return false;
    if (typeof campaign_name != 'string') return false;
    let stmt = [];
    let param = [];
    for (const [key, value] of Object.entries(items)) {
      if (key == 'id' || key == 'campaign_name') return false;
      stmt.push(key + "=?");
      if (key == 'status') param.push({ BOOL: value });
      else param.push({ S: value });
    }
    param.push({ S: campaign_name });
    stmt = stmt.join(", ");
    stmt = `UPDATE CloudCall_Campaign_Table SET ${stmt} WHERE campaign_name=?`;
    const data = await ddbDocClient.send(
      new ExecuteStatementCommand({
        Statement: stmt,
        Parameters: param,
      })
    );
    return true;
  },
};

module.exports = { campaignModel };



