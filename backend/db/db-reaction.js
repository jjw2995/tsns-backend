const mongoose = require("mongoose");

let reactionSchema = new mongoose.Schema(
  {
    reaction: {
      type: String,
      enum: ["love", "haha", "sad", "angry"],
      required: true,
    },
    user: {
      _id: { type: String, /* index: true, */ required: true },
      nickname: { type: String, required: true },
    },
    // post: post owner and reaction owner
    // comment: append reaction owner to original DO_UIDs list
    deleteOnUIDs: { type: Array },
    contentID: { type: String, /* index: true, */ required: true },
  },
  { typePojoToMixed: false, timestamps: true }
);
reactionSchema.index({ contentID: 1, "user._id": 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);
