// const mongoose = require('mongoose')

// expression 
//     {
//         post -ref
//         user -ref
//         feeling: happy, sad, b,...
//     }

// let postSchema = new mongoose.Schema(

//     {
//         user: {
//             _id: { type: String, index: true, required: true },
//             nickname: { type: String, required: true }
//         },
//         post: {
//             description: { type: String, maxlength: 150, trim: true, default: '' },
//             media: [{ type: String, trim: true }], // resource address
//             level: { type: String, enum: ['private', 'friends', 'public'], default: 'friends' },
//             likes: { type: Number, default: 0 }
//         }
//     },
//     { typePojoToMixed: false, timestamps: true }
// )

// // postSchema.set('toJSON', {
// //     transform: function (doc, ret, option) {
// //         delete ret.viewLevel
// //         return ret
// //     }
// // })

// const URLsLen = 4

// postSchema.path('post.media').validate(function (value) {
//     if (value.length > URLsLen) {
//         throw new Error('url length no more than 4!')
//     }
// })

// module.exports = mongoose.model('Post', postSchema)