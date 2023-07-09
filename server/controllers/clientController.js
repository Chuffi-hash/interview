const Client = require("../models/client.js");
const Agency = require("../models/agency.js");

const {
  handleSuccessResponse,
  handleErrorResponse,
  handleValidationError,
  handleNotFoundResponse,
} = require("../utils/responseHandler.js");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.createClient = async (req, res) => {
  try {
    const { clients, agencyId } = req.body;
    console.log(agencyId);
    await Promise.all([
      body("clients").isArray().withMessage("clients must be an array"),
      body("clients.*.name").notEmpty().withMessage("Client name is required"),
      body("clients.*.email").isEmail().withMessage("Invalid email format"),
      body("clients.*.phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required"),
      body("clients.*.totalBill")
        .isNumeric()
        .withMessage("Total bill must be a number"),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(
        res,
        "All fields and validation for fields required"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(agencyId) && agencyId) {
      return handleValidationError(res, "Invalid agency ID");
    }
    const agency = await Agency.findById(agencyId);

    if (!agency) {
      return handleNotFoundResponse(res, "Agency with Id not found");
    }
    const createdClient = clients.map((client) => ({
      agencyId,
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber,
      totalBill: client.totalBill,
    }));

    // Save the clients to the database
    await Client.insertMany(createdClient);

    // Return success response with data
    handleSuccessResponse(
      res,
      createdClient,
      "Client details updated successfully"
    );
  } catch (error) {
    // Handle error response
    handleErrorResponse(res, error);
  }
};

// Update Client
exports.updateClientDetails = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { client } = req.body;
    await Promise.all([
      body("client.name").notEmpty().isString().run(req),
      body("client.email").isEmail().withMessage("Invalid email format"),
      body("client.phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required"),
      body("client.*.totalBill")
        .isNumeric()
        .withMessage("Total bill must be a number"),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(
        res,
        "All fields and validation for fields required"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(clientId) && clientId) {
      return handleValidationError(res, "Invalid agency ID");
    }
    // Update Client
    const updatedClient = await Client.findByIdAndUpdate(clientId, client, {
      new: true,
    });
    if (!updatedClient) {
      return handleNotFoundResponse(res, "Client with Id not found");
    }
    // Return success response with data
    handleSuccessResponse(
      res,
      updatedClient,
      "Client details updated successfully"
    );
  } catch (error) {
    // Handle error response
    handleErrorResponse(res, error);
  }
};

// Delete
exports.deleteClient = async (req, res) => {
  try {
    let { clientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clientId) && clientId) {
      return handleValidationError(res, "Invalid client ID");
    }
    let isDeleted = await Client.findOneAndDelete({ _id: clientId });
    if (!isDeleted) {
      return handleNotFoundResponse(res, "Client not found");
    }
    return handleSuccessResponse(res, isDeleted, "Client deleted successfully");
  } catch (error) {
    handleErrorResponse(res, error);
  }
};
