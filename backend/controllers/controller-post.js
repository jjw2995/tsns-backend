const { formatError } = require("../utils/helper");
const { PostService, FollowService, CommentService } = require("../services");
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const Reaction = mongoose.model("Reaction");
const Follower = mongoose.model("Follower");
const Comment = mongoose.model("Comment");

const postService = new PostService(Post, Reaction);
const commentService = new CommentService(Comment, Reaction);
const followService = new FollowService(Follower);

module.exports = class PostController {
  post(req, res) {
    let files = Object.values(req.files || []);
    postService
      .addPost(req.user, req.body, files)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(e.status).json(e);
      });
  }

  delete(req, res) {
    let postID = req.body.postID;
    postService
      .removePost(req.user, postID)
      .then((r) => {
        return commentService.removeCommentsOnPost(postID);
      })
      .then((r) => res.sendStatus(204))
      .catch((e) => res.status(400).json(e));
  }

  patch(req, res) {
    postService
      .updatePost(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  get(req, res) {
    let limit = req.query.num;
    // let limit;

    let user = req.user;
    followService
      .getFollowees(user)
      .then((followees) => {
        return postService.getPosts(user, followees, limit);
      })
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(formatError(e)));
  }

  getMine(req, res) {
    let limit;
    postService
      .getMyPosts(req.user, limit)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(formatError(e)));
  }

  getExplore(req, res) {
    // let limit = req.query.limit;
    let limit;
    postService
      .getPublicPosts(req.user, limit)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(500).json(formatError(e));
      });
  }

  postReact(req, res) {
    // console.log(req.body);
    postService
      .postReaction(req.user, req.body._id, req.body.reaction)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e.message));
  }
  // async postReact(req, res) {
  //   // let a = await Post.find({});
  //   // console.log(a);
  //   let b = await postService.postReaction(
  //     req.user,
  //     req.body._id,
  //     req.body.reaction
  //   );
  //   console.log(b);
  //   res.status(200).json(b);
  // }
};

// 	// res.status().send().;
// 	// res.status().json()
// 	// res.send().json()

// 	// req.headers
// 	// req.body
// 	// req.params
// 	// req.query
// };
