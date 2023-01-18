const { modelCDR } = require('../libs/ddbclient.js');
const { getContactCDR } = require('../libs/connectclient.js');

// (async()=>{
//   let r = await getContactCDR('2a6d46dc-7321-44c1-ad77-a3369585132f');
//   console.log(r);
// })();

(async()=>{

const res = await modelCDR.scan().exec();
console.log('~'.repeat(20));
for (let n = 0; n < res.length; n++) {
  console.log(
    res[n].ContactID, 
    res[n].queueId,
    res[n].initiationMethod,
    res[n].describeContactCalled,
    res[n].channel,
    res[n].lastUpdateTimestamp,
    res[n].initiationTimestamp,
    res[n].enqueueTimestamp,
    res[n].disconnectTimestamp,
    res[n].agentId,
    res[n].duration,
    res[n].connectedToAgentTimestamp,
    );
}
console.log('~'.repeat(20));
// for (let n = 0; n < res.length; n++) {
//   new modelCDR({
//     "ContactID": res[n].ContactID
//   }).save()
// }
// console.log(res)
})()