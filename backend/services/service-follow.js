const model = require("mongoose").model("Follower");

// let Follower;

let filterUser = (u) => {
  return { _id: u._id, nickname: u.nickname };
};

const log = (msg) => console.log("\n", msg);
module.exports = class FollowerService {
  constructor(followerModel) {
    this.Follower = followerModel;
  }

  // checked
  createFollow(follower, followee) {
    return new Promise((resolve, reject) => {
      if (follower._id == followee._id) {
        return reject(Error("cannot follow oneself"));
      }
      let doc = {
        follower: filterUser(follower),
        followee: filterUser(followee),
      };
      if (followee.isPrivate) {
        doc.isPending = true;
      }

      this.Follower.create(doc)
        .then((r) => {
          resolve(r.toJSON());
        })
        .catch((e) => reject(e));
    });
  }

  // get people that user is following (user=follower, others=followees)
  getFollowees(user) {
    return new Promise((resolve, reject) => {
      this.Follower.aggregate([
        { $match: { "follower._id": user._id, isPending: false } },
        {
          $project: {
            _id: "$followee._id",
            nickname: "$followee.nickname",
          },
        },
      ])
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // get people that are following the user
  getFollowers(user) {
    return new Promise((resolve, reject) => {
      this.Follower.aggregate([
        { $match: { "followee._id": user._id, isPending: false } },
        {
          $project: {
            _id: "$follower._id",
            nickname: "$follower.nickname",
          },
        },
      ])
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // get user pending followees
  getPendingFollowees(user) {
    return new Promise((resolve, reject) => {
      this.Follower.aggregate([
        { $match: { "follower._id": user._id, isPending: true } },
        {
          $project: {
            _id: "$followee._id",
            nickname: "$followee.nickname",
          },
        },
      ])
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // get user pending followers
  getPendingFollowers(user) {
    return new Promise((resolve, reject) => {
      this.Follower.aggregate([
        { $match: { "followee._id": user._id, isPending: true } },
        {
          $project: {
            _id: "$follower._id",
            nickname: "$follower.nickname",
          },
        },
      ])
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  acceptPendingFollower(followee, follower) {
    return new Promise((resolve, reject) => {
      this.Follower.findOneAndUpdate(
        {
          "follower._id": follower._id,
          "followee._id": followee._id,
          isPending: true,
        },
        { isPending: false /* , hasViewed: false  */ },
        { new: true }
      )
        .then((r) => {
          if (r == null)
            reject(
              new Error(
                "Requester is not private or request has already been fulfilled"
              )
            );
          else resolve(r);
        })
        .catch((e) => reject(e));
    });
  }

  deleteFollower(followeeID, followerID) {
    return new Promise((resolve, reject) => {
      this.Follower.findOneAndDelete({
        "follower._id": followerID,
        "followee._id": followeeID,
        isPending: false,
      })
        .then((r) => {
          if (r == null)
            reject(
              new Error("Already removed or cannot remove pending follower")
            );
          resolve(r);
        })
        .catch((e) => reject(e));
    });
  }

  deleteFollowee(followerID, followeeID) {
    return new Promise((resolve, reject) => {
      this.Follower.findOneAndDelete({
        "follower._id": followerID,
        "followee._id": followeeID,
        // isPending: false,
      })
        .then((r) => {
          if (r == null)
            reject(
              new Error(
                "Already removed or cannot remove not following followee"
              )
            );
          resolve(r);
        })
        .catch((e) => reject(e));
    });
  }
  // check following
  checkFollowing(followerID, followeeID) {
    return new Promise((resolve, reject) => {
      this.Follower.findOne({
        "follower._id": followerID,
        "followee._id": followeeID,
        isPending: false,
      })
        .then((r) => {
          if (r) {
            resolve(!r.isPending);
          } else {
            resolve(false);
          }
        })
        .catch((e) => reject(e));
    });
  }
};
