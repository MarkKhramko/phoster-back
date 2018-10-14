/*
 * This file will hold all standardized outputs and responses
 */

const standardError = (errorDetails) => {
	const obj = {
		"error":{
			"details":errorDetails
		} 
	};

	return obj
};

const createErrorResponse = (response, statusCode, errorDetails) => {
	const res = response.status(statusCode).json(standardError(errorDetails));
	return res;
};

const createValidationErrorResponse = (response, validationResult) => {
  console.error(validationResult.error);
  const errMsg = validationResult.error.details[0].message;
  return createErrorResponse(response, 500, errMsg);
};

module.exports = {
	standardError,
	createErrorResponse,
	createValidationErrorResponse
};