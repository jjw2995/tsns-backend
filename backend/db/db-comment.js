const mongoose = require("mongoose");
let commentSchema = new mongoose.Schema(
  {
    // id: String,
    _id: { type: String, required: true },
    postID: { type: String, index: true, required: true },
    user: {
      nickname: { type: String, required: true },
      _id: { type: String, index: true, required: true },
    },
    parentComID: { type: String, default: null, index: true },
    // hasChild: { type: Boolean, default: false },
    deleteOnUIDs: { type: Array },
    numChild: { type: Number, default: 0 },
    content: {
      type: String,
      maxlength: 150,
      trim: true,
      required: true,
    },
    reactions: {
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
  },
  {
    autoIndex: false,
    typePojoToMixed: false,
    timestamps: true,
    collection: "Comment",
  }
);

// commentSchema.set("toJSON", {
//   transform: function (doc, ret, option) {
//     // delete ret.viewLevel;
//     delete ret.postID;
//     return ret;
//   },
// });

// const URLsLen = 4
// commentSchema.path('post.media').validate(function (value) {
//     if (value.length > URLsLen) {
//         throw new Error('url length no more than 4!')
//     }
// })

module.exports = mongoose.model("Comment", commentSchema);
