describe("/posts", () => {
  beforeEach("followers init, u1 -> u2, u1-> pu1", async () => {
    // await usersInit();
    let a = await postFollow(user_1, user_2);
    let b = await postFollow(user_1, privateUser_1);
    // logRes(a);
    // logRes(b);
  });

  // user_1
  // user_2,
  // privateUser_1,
  // privateUser_2,
  // postFollowers,
  // postPrivate,
  // postPublic,

  describe("POST", () => {
    it("normal insert without pictures", async () => {
      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .send(postAppendNick(user_1, postPublic));
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
    it("normal insert with pictures", async () => {
      let a = await server
        .post("/api/posts")
        .set(getAuthBear(user_1))
        .attach("f_1", fs.readFileSync("./z.png"), "z.png")
        .attach("f_2", fs.readFileSync("./test1.png"), "test1.png")
        .field(postPrivate);

      expect(a.body.user._id).to.eql(user_1._id);
      expect(a.body.media.length).to.eql(2);

      let b = await server
        .delete("/api/posts")
        .set(getAuthBear(user_1))
        .send(a.body);
      expect(b.status).to.eql(204);
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
  describe("those that need posts set up", () => {
    beforeEach(async () => {
      await userPrivPubFolPost(user_1);
      await userPrivPubFolPost(user_2);
      await userPrivPubFolPost(privateUser_1);
    });
    describe("GET", () => {
      it("fetch user_1's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(5);
      });

      it("fetch user_1's home posts after privateUser_1 accepts user_1", async () => {
        await acceptFollower(privateUser_1, user_1);
        let a = await server.get("/api/posts").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(7);
      });
      it("fetch privateUser_2's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(privateUser_2));
        // logRes(a);
        expect(a.body.length).eql(0);
      });
      it("fetch user_2's home posts", async () => {
        let a = await server.get("/api/posts").set(getAuthBear(user_2));
        // logRes(a);
        expect(a.body.length).eql(3);
      });
    });
    describe("GET /explore", () => {
      it("fetch user_1's explore posts", async () => {
        let a = await server.get("/api/posts/explore").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(3);
      });

      it("fetch user_1's explore posts after privateUser_1 accepts user_1", async () => {
        await acceptFollower(privateUser_1, user_1);
        let a = await server.get("/api/posts/explore").set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).eql(3);
      });
      it("fetch privateUser_2's explore posts", async () => {
        let a = await server
          .get("/api/posts/explore")
          .set(getAuthBear(privateUser_2));
        // logRes(a);
        expect(a.body.length).eql(3);
      });
      it("fetch user_2's explore posts", async () => {
        let a = await server.get("/api/posts/explore").set(getAuthBear(user_2));
        // logRes(a);
        expect(a.body.length).eql(3);
      });
    });
    //
    //
    //
    describe("GET /mine", () => {
      it("fetch user_1's own posts", async () => {
        let a = await server.get("/api/posts/mine").set(getAuthBear(user_1));
        logRes(a);
        // expect(a.body.length).eql(3);
      });
      it("fetch privateUser_2's own posts", async () => {
        let a = await server
          .get("/api/posts/mine")
          .set(getAuthBear(privateUser_2));
        logRes(a);
        // expect(a.body.length).eql(0);
      });
    });
    describe("DELETE", () => {
      // it("fetch user_1's own posts", async () => {
      // 	let a = await server.get('/api/posts/mine').set(getAuthBear(user_1));
      // 	logRes(a);
      // 	// expect(a.body.length).eql(3);
      // });
    });
    describe("PATCH", () => {});
  });
});
