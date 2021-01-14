const express = require("express");
const router = express.Router();
const { CommentController } = require("../../controllers/index");

const { validate, Segments, Joi } = require("../../utils/validations");

let commentController = new CommentController();

const content = Joi.string().min(1).max(150).required();
const num = Joi.number().optional();

const lastCreatedAt = Joi.date().optional();
const postID = Joi.string()
  .alphanum()
  .custom((value, helper) => {
    if (value[0] !== "p") {
      return helper.message("given id is not a postID");
    }
    return value;
  })
  .required();
const commentID = Joi.string()
  .custom((value, helper) => {
    if (value[0] !== "c") {
      return helper.message("given id is not a commentID");
    }
    return value;
  })
  .alphanum()
  .required();
const reaction = Joi.string().valid("love", "haha", "sad", "angry").required();

router.post(
  "/",
  validate(Segments.BODY, { postID, content }),
  validate(Segments.BODY, { parentComID: commentID.optional() }),
  commentController.post
);

router.get(
  "/subcomments/:parentCommentID",
  validate(Segments.PARAMS, { parentCommentID: commentID }),
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  commentController.getSubcomments
);

router.get(
  "/:postID",
  validate(Segments.PARAMS, { postID }),
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  commentController.getComments
);

router.post(
  "/react",
  validate(Segments.BODY, { commentID, reaction }),
  commentController.postReact
);

router.delete(
  "/react/:commentID",
  validate(Segments.PARAMS, { commentID }),
  commentController.deleteReact
);

// @
router.delete(
  "/:commentID",
  validate(Segments.PARAMS, { commentID }),
  commentController.delete
);

module.exports = router;
