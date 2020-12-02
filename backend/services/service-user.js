const test = require("mongoose").model("User");
const bcrypt = require("bcryptjs");

module.exports = class UserService {
  constructor(user) {
    this.User = user;
  }
  getUser(userID) {
    // log(userID);
    return new Promise((resolve, reject) => {
      // log(userID);
      this.User.findById(userID)
        .then((r) => {
          if (!r) return reject(Error("such user does not exist"));
          resolve(r.toJSON());
        })
        .catch((e) => reject(e));
    });
  }
  async searchUserByString(q) {
    // let a = await this.User.find({ $text: { $search: /q/ } });
    let a = await this.User.find({
      nickname: { $regex: q /* , $options: "i" */ },
    }).limit(10);
    // log(a);
    return a;
  }
  setIsPrivate(user, body) {
    return new Promise((resolve, reject) => {
      // log(body);
      test
        .findOneAndUpdate(
          { _id: user._id },
          { isPrivate: body.isPrivate },
          { new: true }
        )
        .then((r) => resolve(r))
        .catch((e) => reject(e));
    });
  }

  // async checkUser(id) {
  // 	let user = await this.User.findById(id);
  // 	return user;
  // }
};
