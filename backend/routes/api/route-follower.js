const express = require('express');
const router = express.Router();
const { FollowerController } = require('../../controllers/index');
const { Joi, celebrate, Segments } = require('celebrate');

let followerController = new FollowerController();

let followers = '/followers';
let followees = '/followees';

const _id = Joi.string().required();

// post
// /followees

// body = user_id
router.post(
	followees,
	celebrate({
		[Segments.BODY]: Joi.object()
			.keys({
				_id,
			})
			.unknown(true),
	}),
	followerController.postFollowee
);

// get
// /followees
router.get(followees, followerController.getFollowees);

// get
// /followees/pending
router.get(followees + '/pending', followerController.getPendingFollowees);

// delete
// /followees
router.delete(followees, followerController.deleteFollowee);

//
//==================================================================
//==================================================================
//==================================================================
//

// get
// /followers
router.get(followers, followerController.getFollowers);

// get
// /followers/pending
router.get(followers + '/pending', followerController.getPendingFollowers);

// post
// /followers/accept
router.post(followers + '/accept', followerController.postAccept);

// delete
// /followers
router.delete(followers, followerController.deleteFollower);

module.exports = router;
