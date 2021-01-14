const { FollowService, UserService } = require("../services");
const mongoose = require("mongoose");

const User = mongoose.model("User");
const Follower = mongoose.model("Follower");
let followService = new FollowService(Follower);
let userService = new UserService(User);

module.exports = class FollowController {
  async postFollowee(req, res) {
    let followeeDoc;
    try {
      followeeDoc = await userService.getUser(req.body._id);
    } catch (error) {
      return res.status(404).json({ error: "cannot find such user" });
    }

    try {
      let r = await followService.createFollow(req.user, followeeDoc);
      res.status(200).json(r);
    } catch (error) {
      res.status(503).json({ error: "server error" });
    }
  }

  getFollowees(req, res) {
    followService
      .getFollowees(req.params.uid, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503));
  }

  getPendingFollowees(req, res) {
    followService
      .getPendingFollowees(req.user, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503));
  }

  deleteFollowee(req, res) {
    followService
      .deleteFollowee(req.user._id, req.params.followeeID)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(403).json(e);
      });
  }

  //
  //
  //

  getFollowers(req, res) {
    followService
      .getFollowers(req.params.uid, req.query["last-doc-id"])
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503));
  }

  getDismissedPendingFollowers(req, res) {
    followService
      .getPendingFollowers(req.user, req.query["last-doc-id"], true)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503));
  }

  getPendingFollowers(req, res) {
    followService
      .getPendingFollowers(req.user, req.query["last-doc-id"], false)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503));
  }

  postFollowersAccept(req, res) {
    followService
      .acceptPendingFollower(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(404).json(e));
  }

  deleteFollower(req, res) {
    followService
      .deleteFollower(req.user._id, req.params.followerID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }

  getFollowsCount(req, res) {
    followService
      .getFollowsCounts(req.params._id)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(503).json(e));
  }

  setFollowingPendingSeen(req, res) {
    followService
      .setFollowingPendingSeen(req.user._id, req.body._id)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(404).json(e));
  }
};
