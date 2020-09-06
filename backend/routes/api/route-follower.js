const express = require('express');
const router = express.Router();
const { FollowController } = require('../../controllers/index');
const { Joi, celebrate, Segments } = require('celebrate');

let followController = new FollowController();

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
	followController.postFollowee
);

// get
// /followees
router.get(followees, followController.getFollowees);

// get
// /followees/pending
router.get(followees + '/pending', followController.getPendingFollowees);

// delete
// /followees
router.delete(followees, followController.deleteFollowee);

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
router.get(followers + '/pending', followController.getPendingFollowers);

// post
// /followers/accept
router.post(followers + '/accept', followController.postAccept);

// delete
// /followers
router.delete(followers, followController.deleteFollower);

module.exports = router;
