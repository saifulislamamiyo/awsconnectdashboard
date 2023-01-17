const { modelAgent, modelCDR } = require("./libs/ddbclient");


// (async()=>{
// let r = await modelCDR.scan().exec();
// console.log(r.length)
// })();


  let currentDateTime = new Date();
  let startTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), 0, 0, 0, 0);
  let startFromEpoch = startTime / 1000;
  console.log(currentDateTime, startTime, String(startTime),startTime.getHours() , startFromEpoch)
