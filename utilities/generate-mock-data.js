const { modelAgent, modelCDR } = require("../libs/ddbclient");

let mockAgents100 = [
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-1",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-1",
    "agentName": "Jane-1",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-1"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-2",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-2",
    "agentName": "Jane-2",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-2"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-3",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-3",
    "agentName": "Jane-3",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-3"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-4",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-4",
    "agentName": "Jane-4",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-4"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-5",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-5",
    "agentName": "Jane-5",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-5"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-6",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-6",
    "agentName": "Jane-6",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-6"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-7",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-7",
    "agentName": "Jane-7",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-7"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-8",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-8",
    "agentName": "Jane-8",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-8"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-9",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-9",
    "agentName": "Jane-9",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-9"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-10",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-10",
    "agentName": "Jane-10",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-10"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-11",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-11",
    "agentName": "Jane-11",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-11"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-12",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-12",
    "agentName": "Jane-12",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-12"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-13",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-13",
    "agentName": "Jane-13",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-13"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-14",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-14",
    "agentName": "Jane-14",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-14"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-15",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-15",
    "agentName": "Jane-15",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-15"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-16",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-16",
    "agentName": "Jane-16",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-16"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-17",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-17",
    "agentName": "Jane-17",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-17"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-18",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-18",
    "agentName": "Jane-18",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-18"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-19",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-19",
    "agentName": "Jane-19",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-19"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-20",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-20",
    "agentName": "Jane-20",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-20"
  },
  {
    "campaigns": [],
    "routingProfileName": "automated_rp_062b8f8c-39a2-45b2-b22b-0dfde609ccdd-21",
    "updatedAt": 1669210000000,
    "createdAt": 1669210000000,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-21",
    "agentName": "Jane-21",
    "author": "default",
    "routingProfileId": "349de5ed-b050-4179-8c6c-599396577b79-21"
  }
]



/**
 * INSERT/DELETE ACTUAL ContactID
 */

// const actContactID = [
//   {"ContactID":"dba425a5-801b-4b1a-b57f-ce0803929788"},
//   {"ContactID":"d9fcd9e4-a3fa-4f51-ac46-3d8f4ffdc5f2"},
//   {"ContactID":"e4f2ee7f-099b-4b38-afb2-3048f2222001"},
//   {"ContactID":"6fb4feca-6dc2-41dd-afaa-4e5307c4d2c7"},
//   {"ContactID":"6fb4feca-6dc2-41dd-afaa-4e5307c4d2c7-mock"},
// ];
// for(let n=0;n<actContactID.length;n++){
//   let thisActContactID = actContactID[n];
//   new modelCDR(thisActContactID).save();
//   // new modelCDR(thisActContactID).delete();
// };


/**
 * INSERT/DELETE Mock Agents
 */

// for(let n=0;n<mockAgents100.length;n++){
//   let thisMockAgent = mockAgents100[n];
//   let newAgent = new modelAgent(thisMockAgent);
//   newAgent.save()
// }

/**
 * INSERT/DELETE Mock CDR
 */

let mockCDRS = [
  {
    "ContactID": "d9fcd9e4-a3fa-4f51-ac46-3d8f4ffdc5f2-735",
    "queueId": "044119d2-7b7f-4f3d-9712-ad097fefee70",
    "initiationTimestamp": 1673951030,
    "disconnectTimestamp": 1673951112,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-7",
    "duration": 82,
    "describeContactCalled": 1,
    "initiationMethod": "INBOUND",
    "channel": "VOICE",
    "connectedToAgentTimestamp": 1673951030,
    "enqueueTimestamp": 1673951030,
    "lastUpdateTimestamp": 1673951030
  },
  {
    "ContactID": "d9fcd9e4-a3fa-4f51-ac46-3d8f4ffdc5f2-736",
    "queueId": "ced78854-5349-43cb-a90a-49289b9ae0ef",
    "initiationTimestamp": 1673944416,
    "disconnectTimestamp": 1673944488,
    "agentId": "062b8f8c-39a2-45b2-b22b-0dfde609ccdd-6",
    "duration": 72,
    "describeContactCalled": 1,
    "initiationMethod": "INBOUND",
    "channel": "VOICE",
    "connectedToAgentTimestamp": 1673944416,
    "enqueueTimestamp": 1673944416,
    "lastUpdateTimestamp": 1673944416
  }
];

function sleepFor(sleepDuration){
  var now = new Date().getTime();
  while(new Date().getTime() < now + sleepDuration){ /* Do nothing */ }
}

for (let n = 0; n < mockCDRS.length; n++) {
  let thisMockCDR = mockCDRS[n];
  let newCDR = new modelCDR(thisMockCDR);
  // newCDR.delete()
  console.log(`saving ${n}`)
  newCDR.save()
  sleepFor(100);
  if( (n%50)==0){
    sleepFor(5000);
  }
}