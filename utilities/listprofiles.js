const { listRoutingProfiles } = require("../libs/connectclient");

(async () => {
  let routingProfiles = await listRoutingProfiles();
  console.log("\n\n", "Routing Profiles:", "\n\n");
  for (r = 0; r < routingProfiles.length; r++) {
    console.log("Id:", routingProfiles[r].Id, "Name:", routingProfiles[r].Name)
  }
  console.log("\n\n", "Record Count:", routingProfiles.length)
})();