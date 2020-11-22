const bcrypt = require("bcryptjs");
const { filterObjPropsBy } = require("../utils/sanatizor");
const jwt = require("jsonwebtoken");

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// let this.User;
module.exports = class AuthService {
  constructor(userModel) {
    this.User = userModel;
  }

  /**
   * TODO:
   *  do email verification
   *    - TTL on user collection
   *    - have verifing endpoint
   */
  registerUser(user) {
    user.salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, user.salt);
    delete user.isPrivate;
    return new Promise((resolve, reject) => {
      this.User.create(user)
        .then((r) => {
          let res = r.toJSON();
          res.email = user.email;
          resolve(res);
        })
        .catch((e) => {
          reject({ errors: [{ email: "this email already exists" }] });
          // reject({ errors: [{ email: e.errors.email.properties.message }] });
        });
    });
  }

  async loginUser(loginfo) {
    let user = await this.User.findOne({ email: loginfo.email });
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

  newAccTokenUser(user) {
    return new Promise((resolve, reject) => {
      this.User.findById(user._id)
        .then((doc) => {
          let docRefreshToken = doc.refreshToken;
          if (!docRefreshToken || docRefreshToken != user.refreshToken) {
            reject({
              error:
                "not a valid refreshToken OR a logged out user, try logging in again",
            });
          } else {
            resolve({ accessToken: genAccessToken(doc.toJSON()) });
          }
        })
        .catch((e) => reject(e));
    });
  }
};

function attachAccRefTokenGivenUser(userJson) {
  let uIdNick = getIdNick(userJson);
  userJson.accessToken = genAccessToken(uIdNick);
  userJson.refreshToken = genRefreshToken(uIdNick);
}

function getIdNick(user) {
  // console.log(user);
  return filterObjPropsBy(user, ["_id", "nickname"]);
}

function genAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function genRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}