let formatError = (error) => {
  // console.log(error);
  return { Error: error.message };
};

module.exports = {
  formatError,
};
