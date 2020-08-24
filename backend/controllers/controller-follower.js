const { formatError } = require('./helper');
const { FollowerService, UserService } = require('../services');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Follower = mongoose.model('Follower');
let followerService = new FollowerService(Follower);
let userService = new UserService(User);

module.exports = class FollowerController {
	// _confirmUserExists(user) {
	// 	return new Promise((resolve, reject) => {
	// 		userService.getUser;
	// 	});
	// }

	postFollowee(req, res) {
		userService
			.getUser(req.body)
			.then((r) => {
				return followerService.createFollow(req.user, r);
			})
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}

	getFollowees(req, res) {
		followerService
			.getFollowees(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	getPendingFollowees(req, res) {
		followerService
			.getPendingFollowees(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	deleteFollowee(req, res) {
		followerService
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
		followerService
			.getFollowers(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	getPendingFollowers(req, res) {
		followerService
			.getPendingFollowers(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	postAccept(req, res) {
		// console.log(req.body);
		followerService
			.acceptPendingFollower(req.user, req.body)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}

	deleteFollower(req, res) {
		followerService
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
