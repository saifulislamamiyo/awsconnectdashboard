const {modelAgent} = require("../libs/ddbclient");

(async()=>{
  let agentTable = await modelAgent.scan().exec();
  console.log("\n\nagentTable:\n\n");
  console.log("a.agentName, a.agentId, a.routingProfileName, a.routingProfileId");
  for(let a of agentTable){
    console.log(a.agentName, a.agentId, a.routingProfileName, a.routingProfileId)
  }
})()
