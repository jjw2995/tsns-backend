const express = require("express");
const router = express.Router();
const { UserController } = require("../../controllers/index");
const { validate, Segments, Joi } = require("../../utils/validations");

let userController = new UserController();

/**			api/followers
 */
const query = Joi.string()
  //   .alphanum()
  .pattern(/^[a-zA-Z0-9\_]{0,16}$/)
  .required();
//   Joi.string().disallow(" ").alphanum().required();
const uid = Joi.string().alphanum().required();

router.post("/private", userController.postPrivate);

router.get(
  "/search",
  validate(Segments.QUERY, { query }),
  userController.getSearch
);

router.get('/remove', userController.getRemove)

router.get("/:uid", validate(Segments.PARAMS, { uid }), userController.get);

module.exports = router;
