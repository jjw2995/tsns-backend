const { UserService } = require("./../services");
const User = require("mongoose").model("User");

let userService = new UserService(User);

module.exports = class UserController {
  postPrivate(req, res) {
    userService
      .setIsPrivate(req.user, req.body)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e.message));
  }
  getSearch(req, res) {
    log(req.body.q);
    // userService
    //   .searchUserByString(req.query.q)
    //   .then((r) => res.status(200).json(r))
    //   .catch((e) => res.status(400).json(e));
    userService
      .searchUserByString(req.body.q)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
};
