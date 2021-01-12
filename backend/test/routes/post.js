const { expect } = require("chai");
const { Reaction } = require("../../db");

describe("/posts", () => {
  beforeEach("followers init, u1 -> u2, u1-> pu1", async () => {
    await postFollow(user_1, user_2);
    await postFollow(user_1, privateUser_1);
  });

  describe("POST", () => {
    it("normal insert without pictures", async () => {
      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .send(postAppendNick(user_1, postPublic));
      // logRes(a);
      expect(a.body.level).to.eql(postPublic.level);

      let b = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .send(postAppendNick(user_1, postFollowers));
      expect(b.body.level).to.eql(postFollowers.level);

      let c = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .send(postAppendNick(user_1, postPrivate));
      expect(c.body.level).to.eql(postPrivate.level);
    });
    it.only("normal insert and delete with pictures", async () => {
      console.log(user_1);
      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .attach("img1", "./z.png", "z.png")
        .attach("img2", "./test1.png", "test1.png")
        // .attach("f_1", fs.readFileSync("./z.png"), "z.png")
        // .attach("f_2", fs.readFileSync("./test1.png"), "test1.png")
        .field(postPrivate);
      let d = await Post.find({});
      expect(d.length).to.eql(1);
      // log(d);
      // logRes(a);
      expect(a.body.user._id).to.eql(user_1._id);
      expect(a.body.media.length).to.eql(2);
      // console.log(a.body._id);
      let b = await server
        .delete("/api/posts" + `/${a.body._id}`)
        .set(getAuthBear(user_1))
        .send({ postID: a.body._id });
      // logRes(b);
      expect(b.status).to.eql(204);

      let c = await Post.find({});
      expect(c.length).to.eql(0);
    });
    it("Err, no such level", async () => {
      let p = copy(postPublic);
      p.level = "asd";

      let a = await server.post("/api/posts").set(getAuthBear(user_1)).field(p);
      expect(a.status).to.eql(400);
    });
    it("Err, too short description", async () => {
      let p = copy(postPublic);
      p.description = "d";

      let a = await server.post("/api/posts").set(getAuthBear(user_1)).field(p);
      expect(a.status).to.eql(400);
    });
    it("Err, more than 4 images", async () => {
      let p = copy(postPublic);

      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .attach("f_1", fs.readFileSync("./test1.png"), "test1.png")
        .attach("f_2", fs.readFileSync("./test1.png"), "test1.png")
        .attach("f_3", fs.readFileSync("./test1.png"), "test1.png")
        .attach("f_4", fs.readFileSync("./test1.png"), "test1.png")
        .attach("f_5", fs.readFileSync("./test1.png"), "test1.png")
        .field(p);
      expect(a.status).to.eql(400);
    });
    it("Err, image not an image", async () => {
      let p = copy(postPublic);

      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .attach("t_1", fs.readFileSync("./text.png"), "text.png")
        .attach("t_2", fs.readFileSync("./text.png"), "text.png")
        .attach("t_3", fs.readFileSync("./text.png"), "text.png")
        .field(p);

      expect(a.status).to.eql(400);
      // logRes(a);
    });
  });
  describe("DELETE", () => {
    it("delet a post with comments and reactions", async () => {
      // post 1, 1
      let post = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .send({ level: "public", description: "jkghjg" });
      let otherPost = await server
        .post("/api/posts")
        .set(getAuthBear(user_2))
        .send({ level: "public", description: "jkghjg" });
      post = post.body;

      // comment 1, 1
      let comment = await server
        .post("/api/comments")
        .set(getAuthBear(user_1))
        .send({ postID: post._id, content: "asfsad" });

      await server
        .post("/api/comments")
        .set(getAuthBear(user_1))
        .send({ postID: otherPost.body._id, content: "asfsad" });
      // logRes(comment);
      comment = comment.body;

      // subComment 1, 1
      let subcomment = await server
        .post("/api/comments")
        .set(getAuthBear(user_1))
        .send({
          postID: post._id,
          content: "asfsad",
          parentComID: comment._id,
        });
      // logRes(subcomment);
      subcomment = subcomment.body;

      await server.post("/api/comments").set(getAuthBear(user_2)).send({
        postID: post._id,
        content: "asfsad",
        parentComID: comment._id,
      });

      await server
        .post("/api/comments/react")
        .set(getAuthBear(user_2))
        .send({ commentID: comment._id, reaction: "haha" });
      await server
        .post("/api/comments/react")
        .set(getAuthBear(user_2))
        .send({ commentID: subcomment._id, reaction: "haha" });
      await server
        .post("/api/comments/react")
        .set(getAuthBear(user_1))
        .send({ commentID: comment._id, reaction: "haha" });
      await server
        .post("/api/comments/react")
        .set(getAuthBear(privateUser_2))
        .send({ commentID: subcomment._id, reaction: "haha" });

      // let commentReact;
      // let subcommentReact;
      let postCount;
      let a = await Post.find({});
      expect(a.length).to.eql(2);

      a = await Comment.find({});
      expect(a.length).to.eql(4);

      a = await Reaction.find({});
      expect(a.length).to.eql(4);

      a = await server
        .delete("/api/posts" + `/${post._id}`)
        .set(getAuthBear(user_1));

      a = await Post.find({});
      expect(a.length).to.eql(1);

      a = await Comment.find({});
      expect(a.length).to.eql(1);

      a = await Reaction.find({});
      expect(a.length).to.eql(0);
    });
  });

  describe("those that need posts set up", () => {
    beforeEach(async () => {
      await Post.deleteMany({});

      await userPrivPubFolPost(user_1);
      await userPrivPubFolPost(user_2);
      await userPrivPubFolPost(privateUser_1);
    });
    describe("GET", () => {
      it("fetch user_1's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(user_1));
        expect(a.body.length).eql(5);
      });

      it("fetch user_1's home posts after privateUser_1 accepts user_1", async () => {
        await acceptFollower(privateUser_1, user_1);
        let a = await server.get("/api/posts").set(getAuthBear(user_1));
        expect(a.body.length).eql(7);
      });
      it("fetch privateUser_2's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(privateUser_2));
        expect(a.body.length).eql(0);
      });
      it("fetch user_2's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(user_2));
        expect(a.body.length).eql(3);
      });
    });

    // TESTING: set HIT_SIZE in service-post.js to 1
    describe("GET /explore", () => {
      it("public user fetches, see 2 posts, one from user_1 and privateUser_1", async () => {
        // let a = await Post.find({});

        // await userPrivPubFolPost(user_1);
        // await userPrivPubFolPost(privateUser_1);

        await server
          .post("/api/posts/react")
          .set(getAuthBear(user_2))
          .send({ postID: user_1.publicPostID, reaction: "haha" });

        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_1))
          .send({ postID: privateUser_1.publicPostID, reaction: "haha" });
        // let e = await Post.find({
        //   _id: { $in: [user_1.publicPostID, privateUser_1.publicPostID] },
        // });
        // log(e);
        let a = await server.get("/api/posts/explore").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(2);

        let postIDs = a.body.map((e) => {
          return e._id;
        });
        // log(postIDs);
        // log([user_1.publicPostID, privateUser_1.publicPostID]);

        expect(postIDs).to.have.members([
          user_1.publicPostID,
          privateUser_1.publicPostID,
        ]);
      });
      it("private user fetches, see 2 posts, one from user_1 and privateUser_1", async () => {
        await server
          .post("/api/posts/react")
          .set(getAuthBear(user_2))
          .send({ postID: user_1.publicPostID, reaction: "haha" });
        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_1))
          .send({ postID: privateUser_1.publicPostID, reaction: "haha" });
        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_1))
          .send({ postID: privateUser_1.publicPostID, reaction: "sad" });
        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_2))
          .send({ postID: privateUser_1.publicPostID, reaction: "sad" });

        let a = await server
          .get("/api/posts/explore")
          .set(getAuthBear(privateUser_2));

        // logRes(a);
        expect(a.body.length).eql(2);

        let postIDs = a.body.map((e) => {
          return e._id;
        });

        expect(postIDs).to.have.members([
          user_1.publicPostID,
          privateUser_1.publicPostID,
        ]);
      });
    });
    //
    //
    //
    describe("GET /mine", () => {
      it("get 2 posts with images", async () => {
        await Post.deleteMany({});

        await server
          .post("/api/posts")
          .set(getAuthBear(user_1))
          .attach("f_1", fs.readFileSync("./z.png"), "z.png")
          .attach("f_2", fs.readFileSync("./test1.png"), "test1.png")
          .field(postPrivate);

        await server
          .post("/api/posts")
          .set(getAuthBear(user_1))
          .attach("f_1", fs.readFileSync("./z.png"), "z.png")
          .attach("f_2", fs.readFileSync("./test1.png"), "test1.png")
          .field(postPrivate);

        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));

        let arr = [...a.body[0].media, ...a.body[1].media];
        // qwe.startsWith()
        // log(arr);
        arr.forEach((link) => {
          expect(link.startsWith("https://storage.googleapis.com/tsns")).to.eql(
            true
          );
        });
        let c = await Post.find({});
        expect(c.length).to.eql(2);

        await server
          .delete("/api/posts" + `/${a.body[0]._id}`)
          .set(getAuthBear(user_1));

        let b = await server
          .delete("/api/posts" + `/${a.body[1]._id}`)
          .set(getAuthBear(user_1));

        c = await Post.find({});
        expect(c.length).to.eql(0);
      });
      it("fetch user_1's own posts, 3", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(3);
      });
      it("fetch privateUser_2's own posts, none", async () => {
        let a = await server
          .get("/api/posts/mine")
          .set(getAuthBear(privateUser_2));
        // logRes(a);
        expect(a.body.length).eql(0);
      });
    });
    describe("GET /user/:userID", () => {
      it("err, try to fetch self via /user/:userID", async () => {
        let a = await server
          .get("/api/posts" + `/user/${user_2._id}`)
          .set(getAuthBear(user_2));
        // logRes(a);
        expect(a.status).to.eql(400);
        // expect(a.body.length).eql(3);
      });

      it("fetch other non-private user, before and after following", async () => {
        // log(user_2);
        let a = await server
          .get("/api/posts" + `/user/${user_1._id}`)
          .set(getAuthBear(user_2));
        // logRes(a);
        expect(a.body.length).eql(1);
        expect(a.body[0].level).to.eql("public");

        await postFollow(user_2, user_1);

        a = await server
          .get("/api/posts" + `/user/${user_1._id}`)
          .set(getAuthBear(user_2));
        // expect(a.status).to.eql(400);
        // logRes(a);
        expect(a.body[0].level).to.eql("followers");
        expect(a.body.length).eql(2);
      });
      it("fetch other private user, before and after following", async () => {
        // log(user_2);
        let a = await server
          .get("/api/posts" + `/user/${privateUser_1._id}`)
          .set(getAuthBear(user_2));

        // logRes(a);

        expect(a.body.length).eql(1);
        expect(a.body[0].level).to.eql("public");

        await postFollow(user_2, privateUser_1);
        await acceptFollower(privateUser_1, user_2);

        a = await server
          .get("/api/posts" + `/user/${privateUser_1._id}`)
          .set(getAuthBear(user_2));
        // logRes(a);
        // expect(a.status).to.eql(400);
        expect(a.body[0].level).to.eql("followers");
        expect(a.body.length).eql(2);
        // expect(a.status).to.eql(400);
        // expect(a.body.length).eql(3);
      });
    });

    describe("POST /react", () => {
      it("owner and users react to post", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));
        // logRes(a);
        await server
          .post("/api/posts/react")
          .set(getAuthBear(user_2))
          .send({ postID: a.body[0]._id, reaction: "haha" });
        // logRes(f);
        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_1))
          .send({ postID: a.body[0]._id, reaction: "love" });
        await server
          .post("/api/posts/react")
          .set(getAuthBear(privateUser_2))
          .send({ postID: a.body[0]._id, reaction: "haha" });
        let b = await server
          .post("/api/posts/react")
          .set(getAuthBear(user_1))
          .send({ postID: a.body[0]._id, reaction: "love" });
        // logRes(b);
        expect(b.body.reactions.haha).to.eql(2);
        expect(b.body.reactions.love).to.eql(2);
        expect(b.body.userReaction).to.eql("love");
      });

      it("repetitve reaction by user, keep the last one", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));
        // logRes(a);
        await server
          .post("/api/posts/react")
          .set(getAuthBear(user_1))
          .send({ postID: a.body[0]._id, reaction: "love" });
        let b = await server
          .post("/api/posts/react")
          .set(getAuthBear(user_1))
          .send({ postID: a.body[0]._id, reaction: "haha" });
        // logRes(b);
        // log(b.body.reactions.haha);
        expect(b.body.reactions.haha).to.eql(1);
        expect(b.body.reactions.love).to.eql(0);
        expect(b.body.userReaction).to.eql("haha");
      });

      it("wrong reaction", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));
        // log(a.body[0]);
        let b = await server
          .post("/api/posts/react")
          .set(getAuthBear(user_1))
          .send({ postID: a.body[0]._id, reaction: "hahaa" });
        expect(b.status).to.eql(400);
      });
    });
    describe("PATCH", () => {
      it("user_1 patch own post", async () => {
        let b = await server.patch("/api/posts").set(getAuthBear(user_1)).send({
          postID: user_1.publicPostID,
          description: "patched",
          level: "private",
        });
        expect(b.body.description).eql("patched");
        expect(b.body.level).eql("private");
      });
      it("user_1 tries to patch other user's post", async () => {
        let b = await server.patch("/api/posts").set(getAuthBear(user_1)).send({
          postID: privateUser_1.publicPostID,
          description: "patched",
          level: "private",
        });
        // logRes(b);
        expect(b.status).eql(400);
      });
    });

    // NEED TO POPULATE COMMENTS B4 DELETING
    describe("DELETE /react", () => {
      it("user_1 react to own post, 3", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));

        let b = await server
          .post("/api/posts/react")
          .set(getAuthBear(user_1))
          .send({ postID: a.body[0]._id, reaction: "haha" });
        // logRes(b);

        let d = await Reaction.find({});
        // log(d);
        expect(d.length).to.eql(1);

        let c = await server
          .delete("/api/posts/react" + `/${b.body._id}`)
          .set(getAuthBear(user_1));
        // .send({ postID: a.body[0]._id, reaction: "haha" });
        // logRes(c);

        d = await Reaction.find({});
        // log(d);
        expect(d.length).to.eql(0);
        // // log(d);
      });

      it("tries to remove reaction when user did not react", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));

        let d = await Reaction.find({});
        // log(d);
        expect(d.length).to.eql(0);

        let c = await server
          .delete("/api/posts/react" + `/${a.body[0]._id}`)
          .set(getAuthBear(user_1));
        // .send({ _id: a.body[0]._id, reaction: "haha" });
        // logRes(c);

        d = await Reaction.find({});
        // log(d);
        expect(d.length).to.eql(0);
        // // log(d);
      });
    });
    //
    //
    //
  });
});
