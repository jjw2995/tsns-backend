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
// /followees
router.get(followees, followController.getFollowees);

// get
// /followees/pending
router.get(followees + "/pending", followController.getPendingFollowees);

// delete
// /followees
router.delete(
  followees + "/:followeeID",
  validate(Segments.PARAMS, { followeeID: _id }),
  followController.deleteFollowee
);

//
//==================================================================
//==================================================================
//==================================================================
//

// get
// /followers
router.get(followers, followController.getFollowers);

// get
// /followers/pending
router.get(followers + "/pending", followController.getPendingFollowers);

router.post(
  followers + "/accept",
  validate(Segments.BODY, { _id }),
  followController.postFollowersAccept
);

// "/:userID",
//   // celebrate({ [Segments.BODY]: Joi.object().keys({ _id }).unknown }),
//   validate(Segments.PARAMS, { userID: _id }),
router.delete(
  followers + "/:followerID",
  validate(Segments.PARAMS, { followerID: _id }),
  followController.deleteFollower
);

module.exports = router;
