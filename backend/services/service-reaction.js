const qwe = require('mongoose').model('Reaction');

let log = (m) => console.log('\n', m, '\n');
let Reaction;

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

module.exports = class ReactionService {
	constructor(reactionModel) {
		Reaction = reactionModel;
	}

	// add reaction
	// contentType: enum[ 'post', 'comment' ]
	async addReaction(user, emotion, contentID) {
		let a = await Reaction.create({ emotion, user, contentID });
		return a;
	}

	async updateReaction(reactionID, emotion) {
		let u = { emotion: emotion };
		let ans = Reaction.findByIdAndUpdate(reactionID, u, { new: true }).lean();
		return ans;
	}

	// remove reaction
	async removeReaction(reactionID) {
		let ans = qwe.findByIdAndDelete(reactionID);
		return ans;
	}

	// {$group : { _id : '$user', count : {$sum : 1}}}
	// get all reaction based on content (post || comment)
	async getReactionCounts(contentID) {
		let a = await Reaction.aggregate([
			{ $match: { contentID: contentID } },
			{
				$group: {
					_id: '$emotion',
					count: { $sum: 1 },
				},
			},
			{ $unwind: '$_id' },
		]);
		log(a);
		return a;
	}

	// user: {
	//     _id: { type: String, index: true, required: true },
	//     nickname: { type: String, required: true }
	// },
	// description: { type: String, maxlength: 150, trim: true }, // resource address
	// mediaURLs: [{ type: String, trim: true }],
	// viewLevel: { type: String, enum: ['private', 'friends', 'public'] }
};
