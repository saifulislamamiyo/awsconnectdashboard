const {modelPhoneNumber} = require("../libs/ddbclient");

(async()=>{
  let phoneNumberTable = await modelPhoneNumber.scan().exec();
  console.log("\n\nphoneNumberTable:\n\n");
  console.log("a.phoneNumber, a.phoneNumberId, a.campaignName, a.campaignId")
  for(let a of phoneNumberTable){
    
    console.log(a.phoneNumber, a.phoneNumberId, a.campaignName, a.campaignId)
  }
})()
