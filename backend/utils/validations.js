const { Joi, celebrate } = require("celebrate");

// class validate {
//   Segments = Segments;
// }

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

// { nickname, email, password }
function val(joiObj, tobeValidated) {
  return function (req, res, next) {
    // let a = Joi.object(joiObj)
    //   .unknown(true)
    //   .validate(req[tobeValidated], { abortEarly: false });
    Joi.object(joiObj)
      .unknown(true)
      .validateAsync(req[tobeValidated], { abortEarly: false })
      .then((r) => {
        log(r);
        next();
      })
      .catch((e) => {
        log(e);
        log({
          errors: e.details.map((r) => {
            // log(r.context);
            return r.message;
          }),
        });

        res.status(400).json(
          e.details.map((r) => {
            return r.message;
          })
        );
      });
    // log(a);
    // // log(a.error.details);
    // next();
  };
}

// [{Segments, [_id, name]},{Segments, [_id, name]}]
// validate(body,[_id, describe])
// let a = new validate();

module.exports = {
  validate,
  Segments,
  Joi,
  val,
  celebrate,
};
