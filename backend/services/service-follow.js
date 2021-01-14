const mongoose = require("mongoose");

let filterUser = (u) => {
  return { _id: u._id, nickname: u.nickname };
};

PAGE_USER = 8;

module.exports = class FollowerService {
  constructor(followerModel) {
    this.Follower = followerModel;
  }

  acceptAllPendingFollowers(uid) {
    return new Promise((resolve, reject) => {
      this.Follower.updateMany(
        { "followee._id": uid, isPending: true },
        { isPending: false }
      )
        .then(() => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  removeFollowsByUID(uid) {
    return new Promise((resolve, reject) => {
      this.Follower.deleteMany({
        $or: [{ "follower._id": uid }, { "followee._id": uid }],
      })
        .then((r) => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  createFollow(follower, followee) {
    return new Promise((resolve, reject) => {
      if (follower._id == followee._id) {
        return reject(Error("cannot follow oneself"));
      }
      let doc = {
        follower: filterUser(follower),
        followee: filterUser(followee),
        hasViewed: false,
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

  getFollowees(uid, lastDocID = null, getAll = false) {
    return new Promise((resolve, reject) => {
      let query = { "follower._id": uid, isPending: false };
      if (lastDocID) {
        query._id = { $lt: mongoose.Types.ObjectId(lastDocID) };
      }
      let aggre = [
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $project: {
            user: {
              _id: "$followee._id",
              nickname: "$followee.nickname",
            },
          },
        },
      ];
      if (!getAll) {
        aggre.push({ $limit: PAGE_USER });
      }
      this.Follower.aggregate(aggre)
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // get people that are following the user
  getFollowers(uid, lastDocID = null, getAll = false) {
    return new Promise((resolve, reject) => {
      let query = { "followee._id": uid, isPending: false };
      if (lastDocID) {
        query._id = { $lt: mongoose.Types.ObjectId(lastDocID) };
      }
      this.Follower.aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $project: {
            user: {
              _id: "$follower._id",
              nickname: "$follower.nickname",
            },
          },
        },
        getAll ? null : { $limit: PAGE_USER },
      ])
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // get user pending followees
  // TODO: PAGE THE RESPONSE
  getPendingFollowees(user, lastDocID = null) {
    return new Promise((resolve, reject) => {
      let query = {
        "follower._id": user._id,
        isPending: true,
      };
      if (lastDocID) {
        query._id = { $lt: mongoose.Types.ObjectId(lastDocID) };
      }
      this.Follower.aggregate([
        // { $match: { "followee._id": user._id, isPending: false } },
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $project: {
            user: {
              _id: "$followee._id",
              nickname: "$followee.nickname",
            },
          },
        },
        { $limit: PAGE_USER },
        // { $match: { "follower._id": user._id, isPending: false } },
      ])
        .then((r) => {
          resolve(r);
        })
        .catch((e) => reject(e));
    });
  }

  // get user pending followers
  getPendingFollowers(user, lastDocID = null, hasViewed = false) {
    return new Promise((resolve, reject) => {
      let query = {
        "followee._id": user._id,
        isPending: true,
        hasViewed: hasViewed,
      };
      if (lastDocID) {
        query._id = { $lt: mongoose.Types.ObjectId(lastDocID) };
      }
      this.Follower.aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $project: {
            user: {
              _id: "$follower._id",
              nickname: "$follower.nickname",
            },
          },
        },
        { $limit: PAGE_USER },
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
        { isPending: false },
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
  //
  //
  // check following
  checkFollowingPending(followerID, followeeID) {
    return new Promise((resolve, reject) => {
      this.Follower.findOne({
        "follower._id": followerID,
        "followee._id": followeeID,
        // isPending: false,
      })
        .then((r) => {
          let rv = { isFollowing: false, isPending: false };

          if (r) {
            rv.isFollowing = true;
            rv.isPending = r.isPending;
          }
          resolve(rv);
        })
        .catch((e) => reject(e));
    });
  }

  setFollowingPendingSeen(userID, followerID) {
    return new Promise((resolve, reject) => {
      this.Follower.findOneAndUpdate(
        {
          "follower._id": followerID,
          "followee._id": userID,
          hasViewed: false,
        },
        { hasViewed: true },
        { new: true }
      )
        .then((r) => {
          resolve(r);
        })
        .catch((e) => reject(e));
    });
  }

  getFollowsCounts(uid) {
    return new Promise((resolve, reject) => {
      this.Follower.aggregate([
        {
          $facet: {
            followersCount: [
              {
                $match: {
                  "follower._id": uid,
                  isPending: false,
                },
              },
              { $count: "followeesCount" },
            ],
            followeesCount: [
              {
                $match: {
                  "followee._id": uid,
                  isPending: false,
                },
              },

              { $count: "followersCount" },
            ],
          },
        },
      ])
        .then((r) => {
          resolve({ ...r[0].followeesCount[0], ...r[0].followersCount[0] });
        })
        .catch((e) => {
          log(e);
          reject(e);
        });
    });
  }
};
