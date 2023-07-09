const jwt = require("jsonwebtoken");
const {
  handleAuthenticationError,
  handleForbiddenError,
} = require("../utils/responseHandler.js");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded; // Set the decoded user information on the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return handleAuthenticationError(res, "Invalid token");
  }
};

module.exports = authenticateToken;
