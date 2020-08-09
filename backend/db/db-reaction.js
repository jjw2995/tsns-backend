const mongoose = require('mongoose')

let reactionSchema = new mongoose.Schema(
    {
        user: {
            _id: { type: String, index: true, required: true },
            nickname: { type: String, required: true }
        },
        contentID: { type: String, required: true },
        reaction: { type: String, enum: ['love', 'funny', 'sad', 'dislike'], required: true },
    },
    { typePojoToMixed: false, timestamps: true, collection: 'Reaction' }
)

// postSchema.set('toJSON', {
//     transform: function (doc, ret, option) {
//         delete ret.viewLevel
//         return ret
//     }
// })


module.exports = mongoose.model('Reaction', reactionSchema)