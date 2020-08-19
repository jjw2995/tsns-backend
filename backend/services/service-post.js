const Reactionable = require('./reactionable');
// const qwe = require('mongoose');.model('Post');

let log = (m) => console.log('\n', m, '\n');
let Post;

const PAGE_SIZE = 8;
module.exports = class PostService extends Reactionable {
	constructor(postModel) {
		super(postModel);
		Post = postModel;
	}

	async addPost(user, post) {
		let _id = 'p' + mongoose.Types.ObjectId();

		let a = await Post.create({
			_id,
			user,
			description: post.description,
			media: post.media,
			level: post.level,
		});
		// log(a.toJSON());
		return a;
	}

	async removePost(user, post) {
		let a = await Post.findOneAndDelete({
			_id: post._id,
			'user._id': user._id,
		});
		if (!a) {
			throw new Error('post is not yours or no such post exists');
		}
		// TODO: delete images on GCC or AWS s3
		// a.media -> remove from cloud storage...
		return;
	}

	async updatePost(user, post) {
		let a = await Post.updateOne(
			{
				_id: post._id,
				'user._id': user._id,
			},
			{
				description: post.description,
				// media: post.media,
				level: post.level,
			}
		);
		if (a.n == 0) {
			throw new Error('post is not yours or no such user/post exists');
		}
		return;
	}

	// TODO: append users Reaction using super
	async getPosts(user, followers, pageSize = PAGE_SIZE) {
		let ids = followers.map((x) => {
			return x._id;
		});
		let q1 = { 'user._id': { $in: ids } };
		let q2 = { level: { $ne: 'private' } };

		let a = await Post.find({
			$or: [{ $and: [q1, q2] }, { 'user._id': user._id }],
		})
			.sort({ createdAt: -1 })
			.limit(pageSize)
			.lean();
		return a;
	}

	async getPublicPosts(pageSize = PAGE_SIZE) {
		let lastHour = new Date();
		lastHour.setHours(lastHour.getHours() - 1);

		let matching = {
			level: 'public',
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
		let projecting = {
			user: 1,
			description: 1,
			media: 1,
			level: 1,
			reactions: 1,
			createdAt: 1,
			updatedAt: 1,
			factor: factoring,
		};

		let a = await Post.aggregate([
			{ $match: matching },
			{ $project: projecting },
			{ $sort: { factor: -1 } },
			{ $project: { factor: 0 } },
			{ $limit: pageSize },
		]);

		return a;
	}
};
