const { Joi, celebrate, Segments } = require("celebrate");

// class validate {
//   Segments = Segments;
// }

let log = (msg) => console.log(msg);
function validate(segment, fields = {}) {
  return celebrate({ [segment]: Joi.object().keys(fields).unknown(true) });
}
// [{Segments, [_id, name]},{Segments, [_id, name]}]
// validate(body,[_id, describe])
// let a = new validate();

module.exports = {
  validate,
  Segments,
  Joi,
};
