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

global.User = mongoose.model("User");
global.Follower = mongoose.model("Follower");
global.Post = mongoose.model("Post");
global.Comment = mongoose.model("Comment");
global.Reaction = mongoose.model("Reaction");

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

// // var common = require("./common");

// describe("top", function () {
beforeEach(async function () {
  await User.deleteMany({});
  await Follower.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Reaction.deleteMany({});
});

//
// importTest("auth", "./routes/auth");

describe("/api", () => {
  require("./routes/auth");

  describe("\n * those that require authed users *\n", () => {
    beforeEach(async () => {
      await usersInit();
    });
    require("./routes/follower");
    require("./routes/post");
    require("./routes/comment");

    // importTest("/followers /followees", "./routes/follower");
    // importTest("/posts", "./routes/post");
  });
});
