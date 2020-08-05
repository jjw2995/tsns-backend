const mongoose = require('mongoose')

let friendSchema = new mongoose.Schema(
	{

		_id: { type: String },
		users: [
			{
				nickname: { type: String, required: true },
				isPending: {
					type: Boolean,
					default: true,
				},
				isFollowing: { type: Boolean, default: true },
				_id: { type: String, required: true, index: true },
				hasViewed: {
					type: Boolean,
					default: false,
				},
			},
		],
		isFriends: {
			type: Boolean,
			default: false,
		},
		friendSince: { type: Date, default: null }
	},
	{ typePojoToMixed: false, timestamps: true }
)

//  { _id: false }
friendSchema.path('users').validate(function (value) {
	// console.log(value.length);
	if (value.length != 2) {
		throw new Error('friend must be between 2 users!')
	}
})

module.exports = mongoose.model('Friend', friendSchema)