const {
  UserService,
  FollowService,
  PostService,
  ReactionService,
  CommentService,
} = require("./../services");
const { User, Follower, Post, Reaction, Comment } = require("../db");

User.updateMany();
const userService = new UserService(User);
const followService = new FollowService(Follower);
const postService = new PostService(Post);
const reactionService = new ReactionService(Reaction);
const commentService = new CommentService(Comment);

module.exports = class UserController {
  async postPrivate(req, res) {
    const { user, body } = req;
    try {
      let re = await userService.setIsPrivate(user, body);
      await followService.acceptAllPendingFollowers(user._id);
      res.status(200).json(re);
    } catch (error) {
      res.status(404).json(e.message);
    }
  }

  async get(req, res) {
    try {
      let user = await userService.getUser(req.params.uid);
      let folPend = await followService.checkFollowingPending(
        req.user._id,
        req.params.uid
      );
      user.isPending = folPend.isPending;
      user.isFollowing = folPend.isFollowing;
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json(error);
    }
  }

  getSearch(req, res) {
    userService
      .searchUserByString(req.query.query)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(404).json(e));
  }

  async removeUser(req, res) {
    try {
      let uid = req.user._id;
      await followService.removeFollowsByUID(uid);

      await postService.removePostsByUID(uid);

      await commentService.removeCommentsByUID(uid);

      await reactionService.removeReactionsByUID(uid);

      await userService.removeUserByUID(uid);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.status(404).json(error);
    }
  }
};
