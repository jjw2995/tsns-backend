const mongoose = require("mongoose");

let FollowerSchema = new mongoose.Schema(
  {
    follower: {
      _id: { type: String, required: true },
      nickname: { type: String, required: true },
    },
    followee: {
      _id: { type: String, required: true },
      nickname: { type: String, required: true },
    },
    isPending: { type: Boolean, default: false },
    hasViewed: {
      type: Boolean,
      default: false,
    },
  },
  { typePojoToMixed: false, timestamps: true }
);

FollowerSchema.index(
  { "follower._id": 1, "followee._id": 1 },
  { unique: true }
);

FollowerSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.__v;
  },
});

FollowerSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("There already exists such follower followee relationship"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Follower", FollowerSchema);
