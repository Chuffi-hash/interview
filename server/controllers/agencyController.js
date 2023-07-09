const Agency = require("../models/agency.js");
const Client = require("../models/client.js");
const {
  handleSuccessResponse,
  handleErrorResponse,
  handleValidationError,
  handleNotFoundResponse,
} = require("../utils/responseHandler.js");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Create Agency and Client
exports.createAgencyAndClient = async (req, res) => {
  try {
    const { agency, clients } = req.body;
    await Promise.all([
      body("agency.name").notEmpty().isString().run(req),
      body("agency.address1").notEmpty().isString().run(req),
      body("agency.address2").optional().isString().run(req),
      body("agency.state").notEmpty().isString().run(req),
      body("agency.city").notEmpty().isString().run(req),
      body("agency.phoneNumber").notEmpty().isString().run(req),
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
        "All fields  and validation for fields required "
      );
    }
    // Check if agency with provided name already exist
    let isExist = await Agency.findOne({
      name: agency.name,
    });
    if (isExist) {
      return handleValidationError(
        res,
        `Agency Name with ${agency.name} already exist`
      );
    }

    //START // Check for duplicate emails within the clients array ,===> it will check if client array contains same emails
    // const clientEmails = clients.map((client) => client.email);

    // const uniqueEmails = new Set(clientEmails);
    // if (clientEmails.length !== uniqueEmails.size) {
    //   return handleValidationError(
    //     res,
    //     "Duplicate emails found in the clients array"
    //   );
    // }
    // END

    // Create Agenvy
    const createAgency = new Agency({
      name: agency.name,
      address1: agency.address1,
      address2: agency.address2,
      state: agency.state,
      city: agency.city,
      phoneNumber: agency.phoneNumber,
    });
    await createAgency.save();

    // Create Cliwnts
    const createdClient = clients.map((client) => ({
      agencyId: createAgency._id,
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber,
      totalBill: client.totalBill,
    }));

    // Save the clients to the database
    await Client.insertMany(createdClient);

    // Return success response
    return handleSuccessResponse(
      res,
      { createAgency, createdClient },
      "Agency and Clients created successfully"
    );
  } catch (error) {
    console.log(error);
    // Handle error response
    return handleErrorResponse(res, error);
  }
};

// Get Agency with Top Clients
exports.getTopClients = async (req, res) => {
  try {
    const topClients = await Agency.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "agencyId",
          as: "clients",
        },
      },
      {
        $unwind: "$clients",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          topClients: {
            $push: {
              clientId: "$clients._id",
              clientName: "$clients.name",
              totalBill: "$clients.totalBill",
            },
          },
          maxBill: { $max: "$clients.totalBill" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$name",
          topClients: {
            $filter: {
              input: "$topClients",
              as: "client",
              cond: { $eq: ["$$client.totalBill", "$maxBill"] },
            },
          },
        },
      },
    ]);

    // Return success response
    handleSuccessResponse(
      res,
      topClients,
      "Top Clients retrieved successfully"
    );
  } catch (error) {
    // Handle error response
    handleErrorResponse(res, error);
  }
};

exports.getAllAgency = async (req, res) => {
  try {
    const agencyWithClients = await Agency.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "agencyId",
          as: "clients",
        },
      },
    ]);

    return handleSuccessResponse(
      res,
      agencyWithClients,
      agencyWithClients.length === 0
        ? "there are no agencies"
        : "Agency via id with client"
    );
  } catch (error) {
    console.log(error);
    // Handle error response
    return handleErrorResponse(res, error);
  }
};

exports.getAgencyViaId = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log(agencyId);
    // Validate agency ID
    if (!mongoose.Types.ObjectId.isValid(agencyId) && agencyId) {
      return handleValidationError(res, "Invalid agency ID");
    }
    let id = new mongoose.Types.ObjectId(agencyId);
    // Find the agency by ID
    const agencyWithClients = await Agency.aggregate([
      { $match: { _id: id } }, // Filter by agency ID
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "agencyId",
          as: "clients",
        },
      },
    ]);
    if (!agencyWithClients) {
      return handleNotFoundResponse(res, "Agency not found");
    }
    return handleSuccessResponse(
      res,
      agencyWithClients,
      "Agency via id with client"
    );
  } catch (error) {
    console.log(error);
    // Handle error response
    return handleErrorResponse(res, error);
  }
};

//Update Agency
exports.updateAgency = async (req, res) => {
  try {
    const { agency } = req.body;
    await Promise.all([
      body("agency.name").notEmpty().isString().run(req),
      body("agency.address1").notEmpty().isString().run(req),
      body("agency.address2").optional().isString().run(req),
      body("agency.state").notEmpty().isString().run(req),
      body("agency.city").notEmpty().isString().run(req),
      body("agency.phoneNumber").notEmpty().isString().run(req),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(
        res,
        "All fields and validation for fields required"
      );
    }

    const { _id } = req.params;
    console.log(_id);
    if (!mongoose.Types.ObjectId.isValid(_id) && _id) {
      return handleValidationError(res, "Invalid agency ID");
    }
    // Find the agency by ID and update its fields
    let updatedAgency = await Agency.findByIdAndUpdate(_id, agency, {
      new: true,
    });
    // Return success response
    if (!updatedAgency) {
      return handleNotFoundResponse(res, "Agency not found");
    }
    return handleSuccessResponse(
      res,
      updatedAgency,
      "Agency updated successfully"
    );
  } catch (error) {
    console.error(error);
    // Handle error response
    return handleErrorResponse(res, error);
  }
};

// Delete
exports.deleteAgency = async (req, res) => {
  try {
    let { agencyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(agencyId) && agencyId) {
      return handleValidationError(res, "Invalid agency ID");
    }
    const deleteClient = await Client.deleteMany({ agencyId });
    let isDeleted = await Agency.findOneAndDelete({ _id: agencyId });

    if (!isDeleted) {
      return handleNotFoundResponse(res, "Agency not found");
    }
    return handleSuccessResponse(
      res,
      { isDeleted, deleteClient },
      "Agency deleted successfully"
    );
  } catch (error) {
    console.log(error);
    // Handle error response
    return handleErrorResponse(res, error);
  }
};
