const mongoose = require('mongoose')

let reactionSchema = new mongoose.Schema(
    {
        emotion: { type: String, enum: ['love', 'haha', 'sad', 'angry'], required: true },
        user: {
            _id: { type: String, /* index: true, */ required: true },
            nickname: { type: String, required: true }
        },
        contentID: { type: String, index: true, required: true },
    },
    { typePojoToMixed: false, timestamps: true, collection: 'Reaction' }
)
reactionSchema.index({ 'user._id': 1, contentID: 1 }, { unique: true })

// postSchema.set('toJSON', {
//     transform: function (doc, ret, option) {
//         delete ret.viewLevel
//         return ret
//     }
// })


module.exports = mongoose.model('Reaction', reactionSchema)