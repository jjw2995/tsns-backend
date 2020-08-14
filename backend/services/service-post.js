const mongoose = require('mongoose');
const Reactionable = require('./reactionable');
const qwe = mongoose.model('Post');

let log = (m) => console.log('\n', m, '\n');
let Post;

const PAGE_SIZE = 5;
module.exports = class PostService extends Reactionable {
	constructor(postModel) {
		super(postModel);
		Post = postModel;
	}

	async addPost(user, post) {
		let _id = 'p' + mongoose.Types.ObjectId();
		let a = await Post.create({ _id, user, post });
		return a;
	}

	async removePost(post) {
		let a = await Post.findByIdAndDelete(post._id);
		return {};
	}

	// async updatePost(postID, post, user) {
	// 	let a = await qwe.updateOne({ _id: postID, 'user._id': user._ud }, post, {
	// 		new: true,
	// 	});

	// 	if (!a) {
	// 		throw new Error("user didn't post the post or no such user/post");
	// 	}
	// 	return a;
	// }

	async getPosts(user, friends, pageSize = PAGE_SIZE) {
		let ids = friends.map((x) => {
			return x._id;
		});

		let a = await Post.find({
			$or: [
				{
					$and: [
						{ 'user._id': { $in: friends } },
						{ 'post.level': { $ne: 'private' } },
					],
				},
				{ 'user._id': user._id },
			],
		})
			.sort({ createdAt: -1 })
			.limit(pageSize);
		return a;
	}

	async getPublicPosts(pageSize = PAGE_SIZE) {
		let lastHour = new Date();
		lastHour.setHours(lastHour.getHours() - 1);

		let matching = {
			'post.level': 'public',
			createdAt: { $gt: lastHour },
		};

		let factoring = {
			$add: [
				'$reactions.love',
				'$reactions.haha',
				'$reactions.sad',
				'$reactions.angry',
			],
		};
		let projecting = { user: 1, post: 1, reactions: 1, factor: factoring };

		let a = await Post.aggregate([
			{ $match: matching },
			{ $project: projecting },
			{ $sort: { factor: -1 } },
			{ $project: { factor: 0 } },
			{ $limit: pageSize },
		]);

		return a;
	}

	// user: {
	//     _id: { type: String, index: true, required: true },
	//     nickname: { type: String, required: true }
	// },
	// post: {
	//     description: { type: String, maxlength: 150, trim: true, default: '' },
	//     media: [{ type: String, trim: true }], // resource address
	//     level: { type: String, enum: ['private', 'friends', 'public'], default: 'friends' },
	//     likes: { type: Number, default: 0 }
	// }
};
