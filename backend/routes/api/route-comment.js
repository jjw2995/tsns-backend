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
    // log(value);
    if (value[0] !== "p") {
      return helper.message("given id is not a postID");
    }
    return value;
  })
  .required();
const commentID = Joi.string()
  .custom((value, helper) => {
    // log(value);
    if (value[0] !== "c") {
      return helper.message("given id is not a commentID");
    }
    return value;
  })
  .alphanum()
  .required();
const reaction = Joi.string().valid("love", "haha", "sad", "angry").required();

// req.body.postID,
// req.body.content,
// req.body.parentCom
router.post(
  "/",
  validate(Segments.BODY, { postID, content }),
  validate(Segments.BODY, { parentComID: commentID.optional() }),
  commentController.post
);

// router.patch("/", commentController.patch);
router.get(
  "/:parentCommentID/subcomments",
  validate(Segments.PARAMS, { parentCommentID: commentID }),
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  commentController.getSubcomments
);

router.get(
  "/:postID",
  validate(Segments.PARAMS, { postID }),
  validate(Segments.QUERY, { "last-created-at": lastCreatedAt, num }),
  commentController.get
);

// .get(`subcomments/${parentComID}?last-created-at=${lastComment.createdAt}`)
//     .then((r) => {
// function identReqArgs(req, res, next) {
//   log(req.params, "\n");
//   log(req.query, "\n");
//   log(req.body, "\n");
//   next();
// }

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

router.delete(
  "/:commentID",
  validate(Segments.PARAMS, { commentID }),
  commentController.delete
);

module.exports = router;
