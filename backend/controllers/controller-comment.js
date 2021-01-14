const { CommentService, FollowService, PostService } = require("../services");
const { Comment, Reaction, Follower, Post } = require("../db");

const commentService = new CommentService(Comment, Reaction);
// const followService = new FollowService(Follower);
const postService = new PostService(Post);

module.exports = class CommentController {
  post(req, res) {
    const { postID, content, parentComID } = req.body;
    postService
      .getPostByID(req.body.postID)
      .then((r) => {
        return commentService.addComment(
          req.user,
          postID,
          r.user._id,
          content,
          parentComID
        );
      })
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(404).json(e));
  }
  getComments(req, res) {
    commentService
      .getPostComments(
        req.user,
        req.params.postID,
        req.query["last-created-at"],
        req.query.num
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
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
      .catch((e) => res.status(400).json(e));
  }

  delete(req, res) {
    commentService
      .removeComment(req.user, req.params.commentID)
      .then((r) => res.sendStatus(204))
      .catch((e) => res.status(400).json(e));
  }
  postReact(req, res) {
    commentService
      .postReaction(req.user, req.body.commentID, req.body.reaction)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
  deleteReact(req, res) {
    commentService
      .deleteReaction(req.user, req.params.commentID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
};
