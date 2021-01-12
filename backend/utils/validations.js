const { Joi, celebrate } = require("celebrate");

function validate(segment, fields = {}) {
  return celebrate({ [segment]: Joi.object().keys(fields).unknown(true) });
}

const Segments = {
  PARAMS: "params",
  HEADERS: "headers",
  QUERY: "query",
  COOKIES: "cookies",
  SIGNEDCOOKIES: "signedCookies",
  BODY: "body",
};

function val(joiObj, tobeValidated) {
  return function (req, res, next) {
    Joi.object(joiObj)
      .unknown(true)
      .validateAsync(req[tobeValidated], { abortEarly: false })
      .then((r) => {
        next();
      })
      .catch((e) => {
        res.status(400).json(
          e.details.map((r) => {
            return r.message;
          })
        );
      });
  };
}

module.exports = {
  validate,
  Segments,
  Joi,
  val,
  celebrate,
};
