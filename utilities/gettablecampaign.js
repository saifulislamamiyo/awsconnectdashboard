const {modelCampaign} = require("../libs/ddbclient");

(async()=>{
  let campTable = await modelCampaign.scan().exec();
  console.log("\n\ncampTable:\n\n");
  console.log("a.campaignName, a.campaignId, a.campaignStatus, a.campaignDescription")
  for(let a of campTable){
    console.log(a.campaignName, a.campaignId, a.campaignStatus, a.campaignDescription)
  }
})()
