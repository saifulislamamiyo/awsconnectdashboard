const express = require('express');
const router = express.Router();
router.get("/", async (req, res, next) => {
  res.render("agentprovision", {
    title: "Agent Provision",
  });
}); // end router.get('/')

module.exports = router;