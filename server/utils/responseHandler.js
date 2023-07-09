const sendResponse = (res, statusCode, data, message = null, error = null) => {
  res.status(statusCode).json({ error, data, message });
};

const handleSuccessResponse = (res, data, message, statusCode = 200) => {
  sendResponse(res, statusCode, data, message);
};

const handleErrorResponse = (res, error, statusCode = 500) => {
  sendResponse(res, statusCode, null, null, error.message);
};

const handleNotFoundResponse = (res, message, statusCode = 404) => {
  sendResponse(res, statusCode, null, message, null);
};

const handleAuthenticationError = (res, message) => {
  sendResponse(res, 401, null, message);
};

const handleForbiddenError = (res, message) => {
  sendResponse(res, 403, null, message);
};

const handleValidationError = (res, message = "Validation error") => {
  sendResponse(res, 400, null, message);
};

const handleTokenExpiredError = (res, message = "Token expired") => {
  sendResponse(res, 401, null, message);
};

module.exports = {
  handleSuccessResponse,
  handleErrorResponse,
  handleAuthenticationError,
  handleValidationError,
  handleTokenExpiredError,
  handleNotFoundResponse,
  handleForbiddenError,
};
