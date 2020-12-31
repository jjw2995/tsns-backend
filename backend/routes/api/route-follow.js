const express = require("express");
const router = express.Router();
const { FollowController } = require("../../controllers/index");
const { validate, Segments, Joi } = require("../../utils/validations");

let followController = new FollowController();

let followers = "/followers";
let followees = "/followees";

const _id = Joi.string().alphanum().required();

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

// get
// /followees
router.get(followees + `/:uid`, followController.getFollowees);
// router.route(followees).get(`/:uid`, followController.getFollowees);

// delete
// /followees
router.delete(
  followees + "/:followeeID",
  // validate(Segments.PARAMS, { followeeID: _id }),
  followController.deleteFollowee
);

//
//==================================================================
//==================================================================
//==================================================================
//

// get
// /followers/pending
router.get(followers + "/pending", followController.getPendingFollowers);

router.get(
  followers + "/pending/dismissed",
  followController.getDismissedPendingFollowers
);

router.post(
  followers + "/accept",
  validate(Segments.BODY, { _id }),
  followController.postFollowersAccept
);

// get followers and followees list
router.get("/follows/count/:_id", followController.getFollowsCount);
// router.get(
//   "/follows/pending",
//   followController.getPendingFollowersAndFollowees
// );

router.post(followers + "/seen", followController.setFollowingPendingSeen);

// "/:userID",
//   // celebrate({ [Segments.BODY]: Joi.object().keys({ _id }).unknown }),
//   validate(Segments.PARAMS, { userID: _id }),
router.delete(
  followers + "/:followerID",
  validate(Segments.PARAMS, { followerID: _id }),
  followController.deleteFollower
);

// get
// /followers
router.get(followers + `/:uid`, followController.getFollowers);

module.exports = router;
