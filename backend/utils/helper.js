const validations = require("./validations");

let formatError = (error) => {
  return error;
  return { Error: error.message };
};

// let formatError1 = (
//   statusCode = 400,
//   error = "Bad Request",
//   message,
//   validation = null
// ) => {
//   return {
//     statusCode: statusCode,
//     error: error,
//     message: message,
//     validation: validation,
//   };
// };

module.exports = {
  formatError,
  // formatError1,
};
