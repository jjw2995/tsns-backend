const { formatError } = require('./helper');
const { FollowerService, UserService } = require('../services');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Follower = mongoose.model('Follower');
let followerService = new FollowerService(Follower);
let userService = new UserService(User);

module.exports = class FollowerController {
	_confirmUserExists(user) {
		return new Promise((resolve, reject) => {
			userService.getUser;
		});
	}

	post(req, res) {
		userService
			.getUser(req.body)
			.then((r) => {
				return followerService.createFollower(req.user, r);
			})
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}

	delete(req, res) {
		followerService
			.deleteFollower(req.user, req.body)
			.then(() => res.sendStatus(204))
			.catch((e) => {
				res.status(400).json(formatError(e));
			});
	}

	get(req, res) {
		followerService
			.getFollowers(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	getWaiting(req, res) {
		followerService
			.getWaiting(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	getPending(req, res) {
		followerService
			.getPending(req.user)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500));
	}

	postAccept(req, res) {
		// console.log(req.body);
		followerService
			.acceptPending(req.user, req.body)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}

	// res.status().send().;
	// res.status().json()
	// res.send().json()

	// req.headers
	// req.body
	// req.params
	// req.query
};
