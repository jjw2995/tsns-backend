global.chai = require("chai");
global.mocha = require("mocha");

global.assert = chai.assert;
global.expect = chai.expect;

chai.should();
chai.config.includeStack = true;
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);

global.server = chai.request(app).keepOpen();

require("./variables");
require("./common");
global.fs = require("fs");
// process.env.NODE_ENV = "test";

// Include common modules from your application that will be used among multiple test suites.
// global.myModule = require("../app/myModule");

const mongoose = require("mongoose");

const User = mongoose.model("User");
const Follower = mongoose.model("Follower");
const Post = mongoose.model("Post");
const Comment = mongoose.model("Comment");
const Reaction = mongoose.model("Reaction");

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

// // var common = require("./common");

describe("top", function () {
  beforeEach(async function () {
    await User.deleteMany({});
    await Follower.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Reaction.deleteMany({});
  });

  //
  importTest("auth", "./routes/auth");

  describe("those that require authed users", () => {
    beforeEach(async () => {
      await usersInit();
    });
    importTest("follow", "./routes/follower");
    importTest("post", "./routes/post");
  });

  //   importTest("b", "./b/b");
});
