const { formatError } = require("./helper");
const { FollowService, UserService } = require("../services");
const mongoose = require("mongoose");

const User = mongoose.model("User");
const Follower = mongoose.model("Follower");
let followService = new FollowService(Follower);
let userService = new UserService(User);

module.exports = class FollowController {
  // _confirmUserExists(user) {
  // 	return new Promise((resolve, reject) => {
  // 		userService.getUser;
  // 	});
  // }

  postFollowee(req, res) {
    userService
      .getUser(req.body)
      .then((r) => {
        return followService.createFollow(req.user, r);
      })
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  getFollowees(req, res) {
    followService
      .getFollowees(req.user)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  getPendingFollowees(req, res) {
    followService
      .getPendingFollowees(req.user)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  deleteFollowee(req, res) {
    followService
      .deleteFollowee(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(400).json(formatError(e));
      });
  }

  //
  //
  //

  getFollowers(req, res) {
    followService
      .getFollowers(req.user)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  getPendingFollowers(req, res) {
    followService
      .getPendingFollowers(req.user)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  postFollowersAccept(req, res) {
    // console.log(req.body);
    followService
      .acceptPendingFollower(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  deleteFollower(req, res) {
    followService
      .deleteFollower(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(400).json(formatError(e));
      });
  }

  // res.status().send().;
  // res.status().json()
  // res.send().json()

  // req.headers
  // req.body
  // req.params
  // req.query
};
