const mongoose = require("mongoose");

let postSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    user: {
      _id: { type: String, index: true, required: true },
      nickname: { type: String, required: true },
    },
    description: { type: String, maxlength: 200, trim: true, default: "" },
    media: [{ type: String, trim: true }], // resource address
    level: {
      type: String,
      enum: ["private", "followers", "public"],
      default: "public",
    },
    // reactions: {
    // 	love: { type: Number, default: 0 },
    // 	haha: { type: Number, default: 0 },
    // 	sad: { type: Number, default: 0 },
    // 	angry: { type: Number, default: 0 },
    // },
  },
  { autoIndex: false, typePojoToMixed: false, timestamps: true }
);

postSchema.set("toJSON", {
  transform: function (doc, ret, option) {
    delete ret.__v;
    // return ret
  },
});

const URLsLen = 4;

postSchema.path("media").validate(function (value) {
  if (value.length > URLsLen) {
    throw new Error("no more than 4 media!");
  }
});

module.exports = mongoose.model("Post", postSchema);
