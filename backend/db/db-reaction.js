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
    contentID: { type: String, index: true, required: true },
  },
  { typePojoToMixed: false, timestamps: true }
);
reactionSchema.index({ contentID: 1, "user._id": 1 }, { unique: true });

// postSchema.set('toJSON', {
//     transform: function (doc, ret, option) {
//         delete ret.viewLevel
//         return ret
//     }
// })

module.exports = mongoose.model("Reaction", reactionSchema);