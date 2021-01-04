const { formatError } = require("../utils/helper");
const { CommentService, FollowService } = require("../services");
const mongoose = require("mongoose");

const Comment = mongoose.model("Comment");
const Reaction = mongoose.model("Reaction");
const Follower = mongoose.model("Follower");

const commentService = new CommentService(Comment, Reaction);
const followService = new FollowService(Follower);

module.exports = class CommentController {
  post(req, res) {
    commentService
      .addComment(
        req.user,
        req.body.postID,
        req.body.content,
        req.body.parentComID
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  get(req, res) {
    commentService
      .getPostComments(
        req.user,
        req.params.postID,
        req.query["last-created-at"],
        req.query.num
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  getSubcomments(req, res) {
    commentService
      .getSubComments(
        req.user,
        req.params.parentCommentID,
        req.query["last-created-at"],
        req.query.num
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  delete(req, res) {
    commentService
      .removeComment(req.user, req.params.commentID)
      .then((r) => res.sendStatus(204))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  postReact(req, res) {
    commentService
      .postReaction(req.user, req.body.commentID, req.body.reaction)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  deleteReact(req, res) {
    commentService
      .deleteReaction(req.user, req.params.commentID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
};
