const { formatError } = require("../utils/helper");
const { FollowService, UserService } = require("../services");
const mongoose = require("mongoose");

const User = mongoose.model("User");
const Follower = mongoose.model("Follower");
let followService = new FollowService(Follower);
let userService = new UserService(User);

module.exports = class FollowController {
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
      .getFollowees(req.params.uid, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  getPendingFollowees(req, res) {
    followService
      .getPendingFollowees(req.user, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  deleteFollowee(req, res) {
    followService
      .deleteFollowee(req.user._id, req.params.followeeID)
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
      .getFollowers(req.params.uid, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  getDismissedPendingFollowers(req, res) {
    followService
      .getPendingFollowers(req.user, req.query["last-doc-id"], true)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  getPendingFollowers(req, res) {
    followService
      .getPendingFollowers(req.user, req.query["last-doc-id"], false)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500));
  }

  postFollowersAccept(req, res) {
    followService
      .acceptPendingFollower(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }

  deleteFollower(req, res) {
    followService
      .deleteFollower(req.user._id, req.params.followerID)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(400).json(formatError(e));
      });
  }

  getFollowsCount(req, res) {
    followService
      .getFollowsCounts(req.params._id)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(e));
  }

  setFollowingPendingSeen(req, res) {
    followService
      .setFollowingPendingSeen(req.user._id, req.body._id)
      .then((r) => {
        res.status(200).json(r);
      })
      .catch((e) => {
        res.status(500).json(e);
      });
  }
};
