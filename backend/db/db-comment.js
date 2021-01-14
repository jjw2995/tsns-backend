const mongoose = require("mongoose");
let commentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    postID: { type: String, index: true, required: true },
    user: {
      nickname: { type: String, required: true },
      _id: { type: String, index: true, required: true },
    },
    parentComID: { type: String, default: null, index: true },
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

module.exports = mongoose.model("Comment", commentSchema);
