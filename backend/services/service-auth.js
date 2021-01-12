const bcrypt = require("bcryptjs");
const { filterObjPropsBy } = require("../utils/sanatizor");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");
const crypto = require("crypto");

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports = class AuthService {
  constructor(userModel) {
    this.User = userModel;
  }

  _genSaltAndHashedPassword(rawPassword) {
    let salt = bcrypt.genSaltSync(10);
    let password = bcrypt.hashSync(rawPassword, salt);
    return { salt, password };
  }

  /**
   * ???: integrate email verification into testing
   */
  registerUser(user) {
    // user.salt = bcrypt.genSaltSync(10);
    // user.password = bcrypt.hashSync(user.password, user.salt);
    let { email, password } = user;
    user = { ...user, ...this._genSaltAndHashedPassword(password) };

    user.verifyingHash = crypto.randomBytes(20).toString("hex");

    delete user.isPrivate;
    return new Promise((resolve, reject) => {
      this.User.create(user)
        .then((r) => {
          let res = r.toJSON();
          res.email = email;
          sendVerificationEmail(email, res._id, user.verifyingHash);
          resolve(res);
        })
        .catch((e) => {
          log(e);
          reject({
            error: "Bad Request",
            message: e.message,
            part: e.part,
            statusCode: 400,
          });
          // reject({ errors: [{ email: e.errors.email.properties.message }] });
        });
    });
  }

  async resendEmail(email) {
    let user = await this.User.findOne({ email: email });
    if (!user) {
      throw {
        status: 404,
        message: `cannot find user with given email, create account`,
      };
    } else if (!user.verifyingHash) {
      throw { status: 400, message: "user already verified" };
    } else {
      sendVerificationEmail(email, user._id, user.verifyingHash);
    }
  }

  async verifyUser(uid, hash) {
    let user = await this.User.findOneAndUpdate(
      { _id: uid, verifyingHash: hash },
      { $unset: { verifyingHash: "" } },
      { new: true }
    );
    if (!user) {
      throw Error(
        "account already verified or 1 hour passed and has been removed, try resending verification email or creating account again"
      );
    }
    return;
  }

  async setupPassReset(email) {
    let hash = crypto.randomBytes(20).toString("hex");
    let user = await this.User.findOneAndUpdate(
      { email: email },
      { resetPassHash: hash }
    );
    if (!user) {
      throw Error("user does not exist, register");
    }
    mailer.sendMail(
      email,
      "click the link below to reset password",
      `${process.env.FRONTEND_BASE_URL}/reset-password/${user._id}/${hash}`,
      "Click Me to Reset Password"
    );
    return;
  }

  async resetPassword(uid, hash, newPassword) {
    let update = this._genSaltAndHashedPassword(newPassword);
    let user = await this.User.findOneAndUpdate(
      { _id: uid, resetPassHash: hash },
      { $unset: { resetPassHash: "" }, $set: update },
      // TODO
      { new: true }
    );
    if (!user) {
      throw Error("have been refreshed or account does not exist");
    }
    return;
  }

  async loginUser(loginfo) {
    let user = await this.User.findOne({
      email: loginfo.email,
      verifyingHash: null,
    });
    if (!user) throw { error: `no user with email "${loginfo.email}"` };
    let passwordMatch = bcrypt.compareSync(loginfo.password, user.password);

    if (!passwordMatch) throw { error: "wrong password or email" };

    let userJson = user.toJSON();
    attachAccRefTokenGivenUser(userJson);

    await user.updateOne({ refreshToken: userJson.refreshToken });
    return userJson;
  }

  logoutUser(user) {
    return new Promise((resolve, reject) => {
      this.User.findOneAndUpdate(
        { _id: user._id, refreshToken: user.refreshToken },
        { refreshToken: undefined },
        { new: true }
      )
        .then((res) => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  // also bundle new refreshToken too
  refreshTokens(user) {
    log(" @ refreshTokens");
    return new Promise((resolve, reject) => {
      this.User.findById(user._id)
        .then((doc) => {
          if (!doc.refreshToken || doc.refreshToken !== user.refreshToken) {
            reject({
              error:
                "not a valid refreshToken OR a logged out user, try logging in again",
            });
          } else {
            doc.refreshToken = genRefreshToken(doc);
            return doc.save();
          }
        })
        .then((r) => {
          resolve({
            accessToken: genAccessToken(r),
            refreshToken: r.refreshToken,
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
};

function attachAccRefTokenGivenUser(userJson) {
  // let uIdNick = getIdNick(userJson);
  userJson.accessToken = genAccessToken(userJson);
  userJson.refreshToken = genRefreshToken(userJson);
}

function genAccessToken({ _id, nickname }) {
  // let uIdNick = getIdNick(user);

  return jwt.sign({ _id, nickname }, ACCESS_TOKEN_SECRET, {
    // expiresIn: "30m",
    // expiresIn: "1000",
    expiresIn: "2000",
  });

  // Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
}

function genRefreshToken({ _id, nickname }) {
  // let uIdNick = getIdNick(user);

  return jwt.sign({ _id, nickname }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    // expiresIn: "60m",
    // expiresIn: "3000",
  });
}

function sendVerificationEmail(email, uid, vhash) {
  mailer.sendMail(
    email,
    "click the link below to verify",
    `${process.env.FRONTEND_BASE_URL}/${uid}/${vhash}`,
    // `${process.env.BASE_URL}/api/auth/verify-account/${uid}/${vhash}`
    "Click Me to Verify"
  );
}
