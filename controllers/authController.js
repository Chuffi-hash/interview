const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const {
  handleSuccessResponse,
  handleErrorResponse,
  handleAuthenticationError,
  handleValidationError,
} = require("../utils/responseHandler.js");
const { body, validationResult } = require("express-validator");

const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return handleAuthenticationError(res, "Invalid username or password");
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return handleAuthenticationError(res, "Invalid username or password");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    return handleSuccessResponse(res, { token, username }, "login Success");
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, "Internal Server Error");
  }
};

const create = async (req, res) => {
  try {
    const { username, password } = req.body;

    await Promise.all([
      body("username").notEmpty().isString().isEmail().run(req),
      body("password").notEmpty().isString().run(req),
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, "All details are required");
    }
    const user = await User.findOne({ username });

    if (user) {
      return handleValidationError(res, "Email already exist");
    }
    // Create a new user instance
    const newUser = new User({ username, password });

    // Save the user to the database
    await newUser.save();

    // Return a success response
    return handleSuccessResponse(res, username, "User created successfully");
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, "Internal Server Error");
  }
};

module.exports = {
  login,
  create,
};
