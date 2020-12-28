const { UserService, FollowService } = require("./../services");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Follower = mongoose.model("Follower");

const userService = new UserService(User);
const followService = new FollowService(Follower);

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
      log(folPend);
      user.isPending = folPend.isPending;
      user.isFollowing = folPend.isFollowing;
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json(e);
    }
  }

  // get(req, res) {
  //   userService
  //     .getUser(req.params.uid)
  //     .then((r) => {
  //       res.status(200).json(r);
  //       return followService.checkFollowing(req.user._id,r._id)
  //     })
  //     .catch((e) => {
  //       res.status(404).json(e);
  //     });
  // }
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
};
