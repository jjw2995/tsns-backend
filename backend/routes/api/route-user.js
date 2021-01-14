const express = require("express");
const router = express.Router();
const { UserController } = require("../../controllers/index");
const { validate, Segments, Joi } = require("../../utils/validations");

let userController = new UserController();

/**			api/followers
 */
const query = Joi.string()
  .pattern(/^[a-zA-Z0-9\_]{0,16}$/)
  .required();
const uid = Joi.string().alphanum().required();

router.post(
  "/private",
  validate(Segments.BODY, { isPrivate: Joi.boolean().required() }),
  userController.postPrivate
);

router.get(
  "/search",
  validate(Segments.QUERY, { query }),
  userController.getSearch
);

router.delete("/remove", userController.removeUser);

router.get("/:uid", validate(Segments.PARAMS, { uid }), userController.get);

module.exports = router;
