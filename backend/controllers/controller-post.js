const { formatError } = require("./helper");
const { PostService, FollowService } = require("../services");
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const Follower = mongoose.model("Follower");
// const Reaction = mongoose.model('Reaction');

const postService = new PostService(Post);
const followService = new FollowService(Follower);

module.exports = class PostController {
  post(req, res) {
    let files = Object.values(req.files || []);
    postService
      .addPost(req.user, req.body, files)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(e.status).json(e));
  }

  /**
   * TODO: also delete the REACTiONS and COMMENTS and COMMENTS' REACTIONS
   */
  delete(req, res) {
    postService
      .removePost(req.user, req.body)
      .then((r) => res.status(204).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  patch(req, res) {
    postService
      .updatePost(req.user, req.body)
      .then((r) => res.status(204).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  get(req, res) {
    // let limit = req.query.limit;
    let limit;

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
      .getPublicPosts(limit)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(formatError(e)));
  }
};

// 	// res.status().send().;
// 	// res.status().json()
// 	// res.send().json()

// 	// req.headers
// 	// req.body
// 	// req.params
// 	// req.query
// };
