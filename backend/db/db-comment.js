const mongoose = require('mongoose')
let commentSchema = new mongoose.Schema(
    {
        // id: String,
        postID: { type: String, index: true, required: true },
        user: {
            nickname: { type: String, required: true },
            _id: { type: String, index: true, required: true }
        },
        parentComID: { type: mongoose.Schema.ObjectId, default: null, index: true },
        // hasChild: { type: Boolean, default: false },
        numChild: { type: Number, default: 0 },
        content: { type: String, minlength: 1, maxlength: 150, trim: true, required: true }
    },
    { typePojoToMixed: false, timestamps: true, collection: 'Comment' }
)

// postSchema.set('toJSON', {
//     transform: function (doc, ret, option) {
//         delete ret.viewLevel
//         return ret
//     }
// })
// const URLsLen = 4
// commentSchema.path('post.media').validate(function (value) {
//     if (value.length > URLsLen) {
//         throw new Error('url length no more than 4!')
//     }
// })

module.exports = mongoose.model('Comment', commentSchema)