const express = require("express");
const router = express.Router();
const { PostController } = require("../../controllers/index");
const { verifyAccessToken } = require("../../middlewares");
// const { Joi, celebrate, Segments } = require("celebrate");
const { validate, Segments, Joi } = require("./validations");

router.use(verifyAccessToken);

let postController = new PostController();

/**			api/posts
 */

// for JOI validation

const description = Joi.string().min(3).max(200).required();
const level = Joi.string().valid("public", "followers", "private").required();
const _id = Joi.string().alphanum();
/**
 * body {
 * description
 * level
 * }
 */
router.post(
  "/",
  validate(Segments.BODY, { level, description }),
  postController.post
);

/**
 * body{
 * _id
 * }
 */
router.delete("/", validate(Segments.BODY, { _id }), postController.delete);

/**
 * body {
 * _id <post _id>
 * desription
 * }
 */
router.patch(
  "/",
  validate(Segments.BODY, { _id, description, level }),
  postController.patch
);

// TODO ?
// let limit = req.query.limit ???
router.get("/", postController.get);

router.get("/mine", postController.getMine);

// let limit = req.query.limit ???
router.get("/explore", postController.getExplore);

module.exports = router;
