describe("/followers /followees", () => {
  describe("POST /followees", () => {
    it("correct input", async () => {
      let a = await server
        .post("/api/followees")
        .set(getAuthBear(user_1))
        .send({ _id: user_2._id });
      // logRes(a);
      expect(a.status).to.eql(200);
      expect(a.body.isPending).to.eql(false);
    });
    it("correct, private user", async () => {
      let a = await server
        .post("/api/followees")
        .set(getAuthBear(user_1))
        .send({ _id: privateUser_1._id });
      // logRes(a);
      expect(a.status).to.eql(200);
      expect(a.body.isPending).to.eql(true);
    });
    it("req twice, ", async () => {
      await server
        .post("/api/followees")
        .set(getAuthBear(user_1))
        .send({ _id: privateUser_1._id });
      let a = await server
        .post("/api/followees")
        .set(getAuthBear(user_1))
        .send({ _id: privateUser_1._id });
      // logRes(a);
      expect(a.status).to.eql(400);
    });
    it("no such user", async () => {
      let a = await server
        .post("/api/followees")
        .set(getAuthBear(user_1))
        .send({ _id: "5f38bfae4b1b3d3100e431a3" });
      // logRes(a);
      expect(a.status).to.eql(400);
    });
  });

  describe("follower init", () => {
    beforeEach("followers init, u1 -> u2, u1-> pu1", async () => {
      let a = await postFollow(user_1, user_2);
      let b = await postFollow(user_1, privateUser_1);
      // logRes(a);
      // logRes(b);
    });

    describe("GET /followees", () => {
      it("user_1 should get user2", async () => {
        let a = await server.get("/api/followees").set(getAuthBear(user_1));
        // logRes(a);
        // log(a);
        expect(a.body[0]._id).to.eql(user_2._id);
      });
      it("privateUser_1 should get 0 followees", async () => {
        let a = await server
          .get("/api/followees")
          .set(getAuthBear(privateUser_1));
        // logRes(a);
        expect(a.body.length).to.eql(0);
      });
    });
    describe("GET /followees/pending", () => {
      it("user_1 should get privateUser_1", async () => {
        let a = await server
          .get("/api/followees/pending")
          .set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body[0]._id).to.eql(privateUser_1._id);
      });
      it("user_1 should get 2 users", async () => {
        await postFollow(user_1, privateUser_2);

        let a = await server
          .get("/api/followees/pending")
          .set(getAuthBear(user_1));
        // logRes(a);
        expect(a.body.length).to.eql(2);
      });
    });
    describe("GET /followers", () => {
      it("user_2 should get user_1", async () => {
        let a = await server.get("/api/followers").set(getAuthBear(user_2));
        // logRes(a);
        expect(a.body[0]._id).to.eql(user_1._id);
      });
      it("privateUser_1 should get 0 users", async () => {
        await postFollow(privateUser_2, privateUser_1);
        let a = await server
          .get("/api/followers")
          .set(getAuthBear(privateUser_1));
        // logRes(a);

        expect(a.body.length).to.eql(0);
      });
    });

    describe("GET /followers/pending", () => {
      it("privateUser_1 should get user_1", async () => {
        let a = await server
          .get("/api/followers/pending")
          .set(getAuthBear(privateUser_1));
        // logRes(a);
        expect(a.body[0]._id).to.eql(user_1._id);
      });
      it("privateUser_1 should get 2 users", async () => {
        await postFollow(privateUser_2, privateUser_1);

        let a = await server
          .get("/api/followers/pending")
          .set(getAuthBear(privateUser_1));
        // logRes(a);
        expect(a.body.length).to.eql(2);
      });
    });

    describe("POST /followers/accept", () => {
      it("privateUser_1 accepts user_1", async () => {
        let a = await server
          .post("/api/followers/accept")
          .set(getAuthBear(privateUser_1))
          .send(user_1);
        // logRes(a);
        expect(a.body.isPending).to.eql(false);
        expect(a.body.follower._id).to.eql(user_1._id);
      });
      it("privateUser_1 accepts user_1 twice, error", async () => {
        await server
          .post("/api/followers/accept")
          .set(getAuthBear(privateUser_1))
          .send(user_1);
        let a = await server
          .post("/api/followers/accept")
          .set(getAuthBear(privateUser_1))
          .send(user_1);
        // logRes(a);
        expect(a.status).to.eql(400);
      });
      it("user_1 accepts user_1, error", async () => {
        let a = await server
          .post("/api/followers/accept")
          .set(getAuthBear(user_2))
          .send(user_1);
        // logRes(a);
        expect(a.status).to.eql(400);
      });
    });

    describe("DELETE /followees", () => {
      it("user_1 deletes user_2", async () => {
        let a = await server
          .delete("/api/followees")
          .set(getAuthBear(user_1))
          .send(user_2);
        // logRes(a);
        expect(a.body.followee._id).to.eql(user_2._id);
      });
      it("user_1 deletes privateUser_1", async () => {
        let a = await server
          .delete("/api/followees")
          .set(getAuthBear(user_1))
          .send(privateUser_1);
        // logRes(a);
        // expect(a.body.isPending).to.eql(false);
        expect(a.body.followee._id).to.eql(privateUser_1._id);
      });
    });

    describe("DELETE /followers", () => {
      it("user_2 deletes user_1", async () => {
        let a = await server
          .delete("/api/followers")
          .set(getAuthBear(user_2))
          .send(user_1);
        // logRes(a);
        expect(a.body.follower._id).to.eql(user_1._id);
      });

      it("privateUser_1 deletes user_1, error", async () => {
        let a = await server
          .delete("/api/followers")
          .set(getAuthBear(privateUser_1))
          .send(user_1);
        // logRes(a);
        expect(a.status).to.eql(400);
      });
    });
  });
});
