const { formatError } = require("./helper");
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
        req.body.parentCom
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  get(req, res) {
    // console.log(req.body.lastComment);
    commentService
      .getPostComments(req.body.postID, req.body.lastComment, req.query.num)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  getSubcomments(req, res) {
    commentService
      .getSubComments(
        req.body.parentCommentID,
        req.body.lastComment,
        req.query.num
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  delete(req, res) {
    // console.log(req.body);
    commentService
      .removeComment(req.user, req.body.commentID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
};
// /**
//  * TODO: also delete the REACTiONS and COMMENTS and COMMENTS' REACTIONS
//  */
// delete(req, res) {
//   commentService.removePost(req.user, req.body)
//     .then((r) => res.status(204).json(r))
//     .catch((e) => res.status(400).json(formatError(e)));
// }

// patch(req, res) {
//   commentService.updatePost(req.user, req.body)
//     .then((r) => res.status(204).json(r))
//     .catch((e) => res.status(400).json(formatError(e)));
// }
// get(req, res) {
//   // let limit = req.query.limit;
//   let limit;

//   let user = req.user;
//   followService
//     .getFollowers(user)
//     .then((followers) => {
//       return commentService.getPosts(user, followers, limit);
//     })
//     .then((r) => res.status(200).json(r))
//     .catch((e) => res.status(500).json(formatError(e)));
// }

// 	// res.status().send().;
// 	// res.status().json()
// 	// res.send().json()

// 	// req.headers
// 	// req.body
// 	// req.params
// 	// req.query
// };
