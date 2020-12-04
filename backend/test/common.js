global.expToHaveProps = function (value, propsArr) {
  for (const iterator of propsArr) {
    expect(value).to.have.property(iterator);
  }
};

global.postAppendNick = function (user, post) {
  let a = JSON.parse(JSON.stringify(post));
  a.description = user.nickname + "_" + post.description;
  return a;
};

global.getAuthBear = function (user) {
  return { authorization: "Bearer " + user.accessToken };
};

global.logRes = function (res, method = "") {
  console.log(
    method,
    "\n",
    "STATUS:\n	",
    res.status,
    "\n",
    "HEADER:\n	",
    res.header,
    "\n\n",
    "BODY:\n	",
    res.body,
    "\n\n\n"
  );
};

global.log = function (msg) {
  console.log("\n\n", msg);
};

global.copy = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

global.expToHaveProps = function (value, propsArr) {
  for (const iterator of propsArr) {
    expect(value).to.have.property(iterator);
  }
};

global.regAndLogin = async function (user, is_private = false) {
  user = {
    nickname: user.nickname,
    email: user.email,
    password: user.password,
  };
  let regiRes = await server.post("/api/auth/register").send(user);

  // SKIP EMAIL VERIFICATION
  await User.findOneAndUpdate(
    { _id: regiRes.body._id },
    { $unset: { verifyingHash: "" } }
  );

  // logRes(asd);
  let temp = JSON.parse(JSON.stringify(user));
  delete temp.nickname;

  // log(temp);
  let a = await server.post("/api/auth/login").send(temp);
  // log(a.body);
  // logRes(a);
  user._id = a.body._id;
  user.accessToken = a.body.accessToken;
  user.refreshToken = a.body.refreshToken;
  if (is_private) {
    let a = await server
      .post("/api/users/private")
      .set(getAuthBear(user))
      .send({ isPrivate: is_private });
    // logRes(a);
  }
  // log(user);
  return user;
};

global.getAuthBear = function (u) {
  // log(u);
  return { authorization: "Bearer " + u.accessToken };
};

global.postFollow = async function (req, other) {
  return await server.post("/api/followees/").set(getAuthBear(req)).send(other);
};

global.usersInit = async function () {
  user_1 = await regAndLogin(user_1);
  user_2 = await regAndLogin(user_2);
  privateUser_1 = await regAndLogin(privateUser_1, true);
  privateUser_2 = await regAndLogin(privateUser_2, true);
};

global.userPrivPubFolPost = async (user) => {
  let a = await server
    .post("/api/posts")
    .set(getAuthBear(user))
    .send(postAppendNick(user, postPublic));
  let b = await server
    .post("/api/posts")
    .set(getAuthBear(user))
    .send(postAppendNick(user, postFollowers));
  let c = await server
    .post("/api/posts")
    .set(getAuthBear(user))
    .send(postAppendNick(user, postPrivate));

  user.publicPostID = a.body._id;
  user.followerPostID = b.body._id;
  user.privatePostID = c.body._id;
  // console.log(user);
};
global.acceptFollower = async function (user, follower) {
  await server
    .post("/api/followers/accept")
    .set(getAuthBear(user))
    .send(follower);
};
