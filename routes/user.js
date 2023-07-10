const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

// login

router.post("/login", authController.login);
router.post("/create", authController.create);

module.exports = router;
