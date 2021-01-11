const { AuthService } = require("../services");
const { User } = require("../db");
/*
 * call other imported services, or same service but different functions here if you need to
 */

let authService = new AuthService(User);

module.exports = class AuthController {
  postSetupPassReset() {}

  postRegister = (req, res) => {
    authService
      .registerUser(req.body)
      .then((newUser) => res.status(200).json(newUser))
      .catch((e) => {
        // log(e);
        res.status(400).json(e);
      });
  };

  postLogin = (req, res) => {
    authService
      .loginUser(req.body)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((e) => {
        res.status(400).json(e);
      });
  };

  getVerify = (req, res) => {
    const { userID, verifyingHash } = req.params;
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

  postSetupPassReset = (req, res) => {
    authService
      .setupPassReset(req.body.email)
      .then((r) => {
        res.status(200).json("password reset email sent");
      })
      .catch((e) => {
        res.status(400).json(e.message);
      });
  };

  postResetPassword = (req, res) => {
    const { userID, resetPassHash, password } = req.body;
    authService
      .resetPassword(userID, resetPassHash, password)
      .then((r) => {
        res.status(200).json("password reset, you can now login");
      })
      .catch((e) => {
        res.status(400).json(e.message);
      });
  };

  postResendEmail = (req, res) => {
    authService
      .resendEmail(req.body.email)
      .then((r) => {
        res.status(200).json("verification email sent again");
      })
      .catch((e) => {
        res.status(e.status).json(e.message);
      });
  };

  postLogout = (req, res) => {
    authService
      .logoutUser(req.user)
      .then((msg) => res.status(204).json(msg))
      .catch((e) => res.status(401).json(e));
  };

  postToken = (req, res) => {
    authService
      .refreshTokens(req.user)
      .then((token) => {
        res.status(200).json(token);
      })
      .catch((e) => res.status(401).json(e));
  };
};
