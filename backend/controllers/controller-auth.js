const { AuthService } = require("../services");
const User = require("mongoose").model("User");
/*
 * call other imported services, or same service but different functions here if you need to
 */

let authService = new AuthService(User);

const postRegister = (req, res) => {
  // log(req.get("host"));
  authService
    .registerUser(req.body)
    .then((newUser) => res.status(200).json(newUser))
    .catch((e) => {
      res.status(400).json(e);
    });
};

const postLogin = (req, res) => {
  authService
    .loginUser(req.body)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((e) => {
      res.status(400).json(e);
    });
};
const getVerify = (req, res) => {
  const { userID, verifyingHash } = req.params;
  log(userID);
  log(verifyingHash);
  authService
    .verifyUser(userID, verifyingHash)
    .then((r) => {
      // log("asdasfasdasds");
      res.status(200).json("your email has been verified, you can now login");
    })
    .catch((e) => {
      res.status(400).json(e.message);
    });
};
const postLogout = (req, res) => {
  authService
    .logoutUser(req.user)
    .then((msg) => res.status(204).json(msg))
    .catch((e) => res.status(401).json(e));
};

const postResendEmail = (req, res) => {
  authService
    .resendEmail(req.body.email)
    .then((r) => {
      res.status(200).json("verification email sent again");
    })
    .catch((e) => {
      res.status(e.status).json(e.message);
    });
};
const postToken = (req, res) => {
  authService
    .newAccTokenUser(req.user)
    .then((token) => {
      res.status(200).json(token);
    })
    .catch((e) => res.status(401).json(e));
};

module.exports = {
  postRegister,
  postLogin,
  getVerify,
  postLogout,
  postToken,
  postResendEmail,
};
