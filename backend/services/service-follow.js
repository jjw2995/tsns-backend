const model = require('mongoose').model('Follower');

let Follower;

let filterUser = (u) => {
	return { _id: u._id, nickname: u.nickname };
};

const log = (msg) => console.log('\n', msg);
module.exports = class FollowerService {
	constructor(followerModel) {
		Follower = followerModel;
	}

	// checked
	createFollow(follower, followee) {
		return new Promise((resolve, reject) => {
			if (follower._id == followee._id) {
				return reject(Error('cannot follow oneself'));
			}
			let doc = {
				follower: filterUser(follower),
				followee: filterUser(followee),
			};
			if (followee.isPrivate) {
				doc.isPending = true;
			}

			Follower.create(doc)
				.then((r) => {
					resolve(r.toJSON());
				})
				.catch((e) => reject(e));
		});
	}

	// get people that user is following (user=follower, others=followees)
	getFollowees(user) {
		return new Promise((resolve, reject) => {
			Follower.aggregate([
				{ $match: { 'follower._id': user._id, isPending: false } },
				{
					$project: {
						_id: '$followee._id',
						nickname: '$followee.nickname',
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
			Follower.aggregate([
				{ $match: { 'followee._id': user._id, isPending: false } },
				{
					$project: {
						_id: '$follower._id',
						nickname: '$follower.nickname',
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
			Follower.aggregate([
				{ $match: { 'follower._id': user._id, isPending: true } },
				{
					$project: {
						_id: '$followee._id',
						nickname: '$followee.nickname',
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
			Follower.aggregate([
				{ $match: { 'followee._id': user._id, isPending: true } },
				{
					$project: {
						_id: '$follower._id',
						nickname: '$follower.nickname',
					},
				},
			])
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	// checked
	acceptPendingFollower(followee, follower) {
		return new Promise((resolve, reject) => {
			Follower.findOneAndUpdate(
				{
					'follower._id': follower._id,
					'followee._id': followee._id,
					isPending: true,
				},
				{ isPending: false /* , hasViewed: false  */ },
				{ new: true }
			)
				.then((r) => {
					if (r == null)
						reject(
							new Error(
								'Requester is not private or request has already been fulfilled'
							)
						);
					else resolve(r);
				})
				.catch((e) => reject(e));
		});
	}

	deleteFollower(followee, follower) {
		return new Promise((resolve, reject) => {
			Follower.findOneAndDelete({
				'follower._id': follower._id,
				'followee._id': followee._id,
				isPending: false,
			})
				.then((r) => {
					if (r == null)
						reject(
							new Error('Already removed or cannot remove pending follower')
						);
					resolve(r);
				})
				.catch((e) => reject(e));
		});
	}

	deleteFollowee(follower, followee) {
		return new Promise((resolve, reject) => {
			Follower.findOneAndDelete({
				'follower._id': follower._id,
				'followee._id': followee._id,
				// isPending: false,
			})
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	// getUpdatedDocs() {
	// 	// new follower
	// 	// {followee: user,isPending: false, hasViewed:false} new follow
	// 	// new follower pending for acceptance
	// 	// {followee: user,isPending: true, hasViewed:false} new pending follow i'm private
	// 	// follow accepted
	// 	// {follower: user,isPending: false, hasViewed:false}		new accepted follow, i'm the follower
	// }

	// {followee: user,isPending: true, hasViewed:true}
	// {followee: user,isPending: true, hasViewed:false} 이때
	// {followee: user,isPending: false, hasViewed:true}
	// {followee: user,isPending: false, hasViewed:false} 이때
	//
	// {follower: user,isPending: true, hasViewed:true}
	// {follower: user,isPending: true, hasViewed:false}
	// {follower: user,isPending: false, hasViewed:true}
	// {follower: user,isPending: false, hasViewed:false} 이때

	// setPendingViewed(followee, follower) {
	// 	return new Promise((resolve, reject) => {
	// 		Follower.updateOne(
	// 			{
	// 				'follower._id': follower._id,
	// 				'followee._id': followee._id,
	// 				isPending: true,
	// 			},
	// 			{ hasViewed: true },
	// 			{ new: true }
	// 		)
	// 			.then((r) => resolve(r))
	// 			.catch((e) => reject(e));
	// 	});
	// }
};
