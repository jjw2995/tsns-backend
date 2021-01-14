const express = require("express");
const router = express.Router();
const { FollowController } = require("../../controllers/index");
const { validate, Segments, Joi } = require("../../utils/validations");

let followController = new FollowController();

let followers = "/followers";
let followees = "/followees";

const _id = Joi.string().alphanum().required();

// get followers and followees list
router.get("/follows/count/:_id", followController.getFollowsCount);

//
//==================================================================
//==================================================================
//==================================================================
//

// post
// /followees

// body = user_id
router.post(
  followees,
  validate(Segments.BODY, { _id }),
  followController.postFollowee
);

// get
// /followees/pending
router.get(followees + "/pending", followController.getPendingFollowees);

router.get(
  followees + `/:uid`,
  validate(Segments.PARAMS, { uid: _id }),
  followController.getFollowees
);

// delete
// /followees
router.delete(
  followees + "/:followeeID",
  validate(Segments.PARAMS, { followeeID: _id }),
  followController.deleteFollowee
);

//
//==================================================================
//

router.get(
  followers + "/pending/dismissed",
  followController.getDismissedPendingFollowers
);

router.post(followers + "/seen", followController.setFollowingPendingSeen);

//
//

router.post(
  followers + "/accept",
  validate(Segments.BODY, { _id }),
  followController.postFollowersAccept
);

router.get(followers + "/pending", followController.getPendingFollowers);

router.get(followers + `/:uid`, followController.getFollowers);

router.delete(
  followers + "/:followerID",
  validate(Segments.PARAMS, { followerID: _id }),
  followController.deleteFollower
);

module.exports = router;
