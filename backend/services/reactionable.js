const qwe = require('mongoose').model('Post');
const log = (msg) => console.log('\n', msg);
let model;
module.exports = class Reactionable {
	constructor(reactionableModel) {
		model = reactionableModel;
	}

	_checkReaction(reaction) {
		if (!['love', 'haha', 'sad', 'angry'].includes(reaction)) {
			throw new Error('reaction is not one of love, haha, sad, and angry');
		}
	}
	// inc (add new reaction)
	async incrementReaction(contentID, reaction) {
		this._checkReaction(reaction);
		// let a = 'reactions.' + reaction
		// log(a)
		let update = { $inc: { ['reactions.' + reaction]: 1 } };
		let options = { new: true };
		let a = await model.findByIdAndUpdate(contentID, update, options);
		return a;
	}

	// dec (remove reaction)
	// TODO: maybe ensure no negative values?
	async decrementReaction(contentID, reaction) {
		this._checkReaction(reaction);

		let update = { $inc: { ['reactions.' + reaction]: -1 } };
		let options = { new: true };
		let a = await model.findByIdAndUpdate(contentID, update, options);
		return a;
	}

	// update dec inc (change existing reation)
	async updateReaction(contentID, previousReaction, newReaction) {
		this._checkReaction(previousReaction);
		this._checkReaction(newReaction);
		let prevReact = 'reactions.' + previousReaction;
		let newReact = 'reactions.' + newReaction;
		let update = { $inc: { [prevReact]: -1 }, $inc: { [newReact]: 1 } };
		let options = { new: true };

		let a = model.findByIdAndUpdate(contentID, update, options);
		return a;
	}

	// _checkNegativeKeepSync

	// reactions: {
	//     love: { type: Number, default: 0 },
	//     haha: { type: Number, default: 0 },
	//     sad: { type: Number, default: 0 },
	//     angry: { type: Number, default: 0 }
	// }
};
