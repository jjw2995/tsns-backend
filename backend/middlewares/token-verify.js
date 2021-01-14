const jwt = require("jsonwebtoken");

const verifyAccessToken = function (req, res, next) {
  let msg = "invalid access token, refresh token";
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: msg });
    }
    req.user = { _id: user._id, nickname: user.nickname };
    next();
  });
};

const verifyRefreshToken = function (req, res, next) {
  let msg = "invalid refresh token, log in again";
  let token = req.body.refreshToken;
  // if (token == null) return res.status(401).json({ error: msg });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: "invalid refreshToken" });
    delete user.iat;
    delete user.exp;
    user.refreshToken = token;
    req.user = user;
    next();
  });
};

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
};

// const model = require('mongoose').model('Follower');
// model.findOneAndUpdate
