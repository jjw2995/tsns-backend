const {
  PostService,
  FollowService,
  CommentService,
  UserService,
} = require("../services");
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const Reaction = mongoose.model("Reaction");
const Follower = mongoose.model("Follower");
const Comment = mongoose.model("Comment");
const User = mongoose.model("User");

let userService = new UserService(User);
const postService = new PostService(Post, Reaction);
const commentService = new CommentService(Comment, Reaction);
const followService = new FollowService(Follower);

function getLastCreatedAt(req) {
  return (
    req.query["last-created-at"] ||
    req.params["last-created-at"] ||
    req.body.lastCreatedAt
  );
}

function getNum(req) {
  let num = parseInt(req.query["num"] || req.params["num"] || req.body.num);
  return postService.getNum(num);
}
module.exports = class PostController {
  post(req, res) {
    let files = Object.values(req.files || []);

    postService
      .addPost(req.user, req.body, files)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(500).json(e);
      });
  }

  delete(req, res) {
    let postID = req.params.postID;
    postService
      .removePost(req.user, postID)
      .then((r) => {
        return commentService.removeCommentsOnPost(postID);
      })
      .then((r) => res.sendStatus(204))
      .catch((e) => {
        res.status(400).json(e);
      });
  }

  patch(req, res) {
    postService
      .updatePost(
        req.user,
        req.body.postID,
        req.body.description,
        req.body.level
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
  get(req, res) {
    let user = req.user;
    followService
      .getFollowees(user._id, null, true)
      .then((followees) => {
        return postService.getPosts(
          user,
          followees,
          getLastCreatedAt(req),
          getNum(req)
        );
      })
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(e));
  }
  async getByUID(req, res) {
    let userID_toGetFrom = req.params.userID;
    try {
      if (req.user._id === userID_toGetFrom) {
        throw {
          status: 400,
          message: "use GET api/posts/mine for getting own posts",
        };
      }
      let folPend = await followService.checkFollowingPending(
        req.user._id,
        userID_toGetFrom
      );
      const { isFollowing, isPending } = folPend;
      let posts = await postService.getPublicPostsByUserID(
        req.user,
        userID_toGetFrom,
        isFollowing && !isPending,
        getLastCreatedAt(req),
        getNum(req)
      );
      res.status(200).json(posts);
    } catch (e) {
      res.status(e.status).json(e.message);
    }
  }

  getMine(req, res) {
    postService
      .getMyPosts(req.user, getLastCreatedAt(req), getNum(req))
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(e));
  }

  getExplore(req, res) {
    postService
      .getExplorePosts(req.user, req.query["last-reactions-count"], getNum(req))
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(500).json(e);
      });
  }

  postReact(req, res) {
    // FIX TO req.body.postID
    postService
      .postReaction(req.user, req.body.postID, req.body.reaction)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e.message));
  }
  deleteReact(req, res) {
    postService
      .deleteReaction(req.user, req.params.postID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
};
