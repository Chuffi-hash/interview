const express = require("express");
const router = express.Router();
const agencyController = require("../controllers/agencyController");
const authentication = require("../middleware/authentication.js");

// 1st API route should creste an agency and client in singlw request
router.post("/", authentication, agencyController.createAgencyAndClient);
router.get("/", authentication, agencyController.getAllAgency);
router.get("/:agencyId", authentication, agencyController.getAgencyViaId);
router.put("/update/:_id", authentication, agencyController.updateAgency);
router.delete(
  "/delete/:agencyId",
  authentication,
  agencyController.deleteAgency
);

// 3rd API route to get agency with top Cliwnts
router.get("/clients/top", agencyController.getTopClients);

module.exports = router;
