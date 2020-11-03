const mongoose = require("mongoose");
// const filterObjPropsBy = require('../utils/sanatizor');
// const uniqueValidator = require("mongoose-unique-validator");
// const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema(
  {
    // _id
    nickname: { type: String, required: [true, "cannot be blank"], trim: true },
    isPrivate: { type: Boolean, default: false },
    email: {
      type: String,
      required: [true, "email cannot be blank"],
      unique: [true, "email must be unique"],
      trim: true,
      lowercase: true,
      index: true,
    },
    birthday: Date,
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

// userSchema.plugin(uniqueValidator, { type: "mongoose-unique-validator" });

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.salt;
    delete ret.email;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    delete ret.refreshToken;
    // delete ret.isPrivate;
    // return ret;
  },
});

// userSchema.set('toJSON', {
// 	transform: function (doc, ret, options) {
// 		ret.id = ret._id;
// 		delete ret.password;
// 		delete ret._id;
// 		delete ret.__v;
// 		delete ret.updatedAt;
// 		delete ret.email;
// 		delete ret.salt;
// 		// delete
// 	},
// });

userSchema.methods.toFilteredJSON = function (filters = []) {
  var json = {};
  filters.map((filter) => {
    json[filter] = this[filter];
  });
  return json;
};

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    // console.log("duplicate");
    next(new Error("There was a duplicate key error"));
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
