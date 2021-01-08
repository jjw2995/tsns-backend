const express = require("express");
const router = express.Router();
const { PostController } = require("../../controllers/index");
const { verifyAccessToken } = require("../../middlewares/token-verify");

const { validate, Segments, Joi } = require("../../utils/validations");

router.use(verifyAccessToken);

let postController = new PostController();
// console.log("\n asd\n");

/**			api/posts
 */

// for JOI validation

const description = Joi.string().min(3).max(200).required();
const level = Joi.string().valid("public", "followers", "private").required();
const _id = Joi.string().alphanum().required();

const postID = Joi.string()
  .alphanum()
  .custom((value, helper) => {
    // log(value);
    if (value[0] !== "p") {
      return helper.message("given id is not a postID");
    }
    return value;
  })
  .required();
const reaction = Joi.string().valid("love", "haha", "sad", "angry").required();
//
//
const lastCreatedAt = Joi.date().optional();
const num = Joi.number().optional();

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@

router.post(
  "/",
  validate(Segments.BODY, { level, description }),
  postController.post
);

router.patch(
  "/",
  validate(Segments.BODY, { postID, description, level }),
  postController.patch
);

// home
router.get(
  "/",
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  postController.get
);

// view my priv, fol, pub posts
router.get(
  "/mine",
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  postController.getMine
);

// get public posts within an hour that has over HIT_SIZE reactions
router.get(
  "/explore",
  // validate(Segments.QUERY, { "last-reactions-count": Joi.number(), num }),
  postController.getExplore
);

// get user's posts
router.get(
  "/user/:userID",
  validate(Segments.PARAMS, { userID: _id }),
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  postController.getByUID
);

router.post(
  "/react",
  validate(Segments.BODY, { postID, reaction }),
  postController.postReact
);

router.delete(
  "/react/:postID",
  validate(Segments.PARAMS, { postID }),
  postController.deleteReact
);

// !!!!!
router.delete(
  "/:postID",
  validate(Segments.PARAMS, { postID }),
  postController.delete
);

// // TODO: get post by postID
// router.get("/:postID");

module.exports = router;
