const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController.js");
const authentication = require("../middleware/authentication.js");

// Update Client Details
router.post("/", authentication, clientController.createClient);
router.put("/:clientId", authentication, clientController.updateClientDetails);
router.delete(
  "/delete/:clientId",
  authentication,
  clientController.deleteClient
);

module.exports = router;
