const { formatError } = require('./helper');
const { PostService, FollowService } = require('../services');
const mongoose = require('mongoose');

const Post = mongoose.model('Post');
const Follower = mongoose.model('Follower');
const Reaction = mongoose.model('Reaction');

const postService = new PostService(Post, Reaction);
const followService = new FollowService(Follower);

module.exports = class CommentController {
	post(req, res) {
		postService
			.addPost(req.user, req.body)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}
	/**
	 * TODO: also delete the REACTiONS and COMMENTS and COMMENTS' REACTIONS
	 */
	delete(req, res) {
		postService
			.removePost(req.user, req.body)
			.then((r) => res.status(204).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}

	patch(req, res) {
		postService
			.updatePost(req.user, req.body)
			.then((r) => res.status(204).json(r))
			.catch((e) => res.status(400).json(formatError(e)));
	}
	get(req, res) {
		// let limit = req.query.limit;
		let limit;

		let user = req.user;
		followService
			.getFollowers(user)
			.then((followers) => {
				return postService.getPosts(user, followers, limit);
			})
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(formatError(e)));
	}

	getExplore(req, res) {
		// let limit = req.query.limit;
		let limit;
		postService
			.getPublicPosts(limit)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(500).json(formatError(e)));
	}
};

// 	// res.status().send().;
// 	// res.status().json()
// 	// res.send().json()

// 	// req.headers
// 	// req.body
// 	// req.params
// 	// req.query
// };
