const mongoose = require('mongoose');

// TODO: modified userSchema (optimize)
let FollowerSchema = new mongoose.Schema(
	{
		follower: {
			_id: { type: String, required: true },
			nickname: { type: String, required: true },
		},
		followee: {
			_id: { type: String, required: true },
			nickname: { type: String, required: true },
		},
		isPending: { type: Boolean, default: false },
		hasViewed: {
			type: Boolean,
			default: false,
		},
	},
	{ typePojoToMixed: false /* , timestamps: true */ }
);

FollowerSchema.index(
	{ 'follower._id': 1, 'followee._id': 1 },
	{ unique: true }
);

FollowerSchema.set('toJSON', {
	transform: function (doc, ret, options) {
		// delete ret.createdAt;
		// delete ret.updatedAt;
		delete ret.__v;
		// return ret;
	},
});

// FollowerSchema.post('save', function (error, doc, next) {
// 	if (error.name === 'MongoError' && error.code === 11000) {
// 		next(new Error('There was a duplicate key error'));
// 	} else {
// 		next();
// 	}
// });

module.exports = mongoose.model('Follower', FollowerSchema);
