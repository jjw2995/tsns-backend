const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    // _id
    nickname: {
      type: String,
      unique: true,
      required: [true, "cannot be blank"],
      trim: true,
    },
    isPrivate: { type: Boolean, default: false },
    email: {
      type: String,
      required: [true, "email cannot be blank"],
      unique: [true, "email must be unique"],
      trim: true,
      lowercase: true,
      index: true,
    },
    // birthday: Date,
    verifyingHash: { type: String },
    resetPassHash: { type: String },

    //
    refreshToken: { type: String },
    //
    password: {
      type: String,
      required: true,
    },
    salt: { type: String, required: true },
  },
  { timestamps: true }
);
userSchema.index(
  { createdAt: 1 },
  // { expireAfterSeconds: 1, partialFilterExpression: { verifyingHash: false } }
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { verifyingHash: { $exists: true } },
  }
);
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.salt;
    delete ret.email;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    delete ret.refreshToken;
    delete ret.verifyingHash;
  },
});

userSchema.methods.toFilteredJSON = function (filters = []) {
  var json = {};
  filters.map((filter) => {
    json[filter] = this[filter];
  });
  return json;
};

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    let err = new Error();
    err.message = "duplicate part";
    // err.name = Object.keys(error.keyValue);
    err.part = Object.keys(error.keyValue)[0];
    next(err);
    // next(new Error(`${Object.keys(error.keyValue)} already exists`));
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
