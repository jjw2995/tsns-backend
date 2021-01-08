const {
  UserService,
  FollowService,
  PostService,
  ReactionService,
  CommentService,
} = require("./../services");
const { User, Follower, Post, Reaction, Comment } = require("../db");

const userService = new UserService(User);
const followService = new FollowService(Follower);
const postService = new PostService(Post);
const reactionService = new ReactionService(Reaction);
const commentService = new CommentService(Comment);

module.exports = class UserController {
  postPrivate(req, res) {
    userService
      .setIsPrivate(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e.message));
  }
  async get(req, res) {
    try {
      let user = await userService.getUser(req.params.uid);
      let folPend = await followService.checkFollowingPending(
        req.user._id,
        req.params.uid
      );
      // log(folPend);
      user.isPending = folPend.isPending;
      user.isFollowing = folPend.isFollowing;
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json(e);
    }
  }

  getSearch(req, res) {
    log(req.query.query);
    // userService
    //   .searchUserByString(req.query.q)
    //   .then((r) => res.status(200).json(r))
    //   .catch((e) => res.status(400).json(e));
    userService
      .searchUserByString(req.query.query)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }

  async getRemove(req, res) {
    /** Remove All Linked
     * posts
     * comments
     * reactions
     * user
     * follows
     **/
    let uid = req.user._id;
    await userService.removeUserByUID(uid);
    await followService.removeFollowsByUID(uid);

    await postService.removePostsByUID(uid);
    // remove posts, grab all user's post ids

    await commentService.removeCommentsByUID(uid);
    // remove user comments,other users subcomments, grab

    await reactionService.removeReactionsByUID(uid);
    // feed in all post ids and comment ids

    res.status(204);
  }
};
