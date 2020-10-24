describe("/auths", () => {
  describe("POST /register", () => {
    it("correct input", async () => {
      // user_1.asd = 'asd';
      let a = await server.post("/api/auth/register").send(user_1);
      // logRes(a);
      expToHaveProps(a.body, ["_id", "nickname"]);
    });
    it("incorrect inputs", async () => {
      let invalNick = JSON.parse(JSON.stringify(user_1));
      let invalPass = JSON.parse(JSON.stringify(user_1));
      let invalEmail = JSON.parse(JSON.stringify(user_1));
      // invalNick.nickname = 'd';
      delete invalNick.nickname;
      delete invalPass.password;
      delete invalEmail.email;

      invalNick.nickname = "d";
      invalPass.password = "asd";
      invalEmail.email = "das";
      invalEmail.nickname = "d";

      let a = await server.post("/api/auth/register").send(invalNick);
      let b = await server.post("/api/auth/register").send(invalPass);
      let c = await server.post("/api/auth/register").send(invalEmail);
      // logRes(a);
      // logRes(b);
      // logRes(c);
      expect(a.status).to.eql(400);
      expect(b.status).to.eql(400);
      expect(c.status).to.eql(400);
    });
    it("email already taken", async () => {
      await server.post("/api/auth/register").send(user_1);
      let a = await server.post("/api/auth/register").send(user_1);
      // logRes(a);
      expect(a.status).to.eql(400);
    });
  });
  describe("POST /login", () => {
    beforeEach(async () => {
      let a = await server.post("/api/auth/register").send(user_1);
    });
    it("correct login", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));
      delete temp.nickname;
      let a = await server.post("/api/auth/login").send(temp);
      // logRes(a);
      expToHaveProps(a.body, [
        "_id",
        "nickname",
        "accessToken",
        "refreshToken",
      ]);
    });

    it("wrong password", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));
      delete temp.nickname;
      temp.password = "as!2aDfsd";
      let a = await server.post("/api/auth/login").send(temp);
      expect(a.status).to.eql(400);
    });
    it("wrong email", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));
      delete temp.nickname;
      temp.email = "as!2aDfsd@gnal.com";
      let a = await server.post("/api/auth/login").send(temp);
      expect(a.status).to.eql(400);
    });
  });
  describe("POST /logout", () => {
    beforeEach(async () => {
      user_1 = await regAndLogin(user_1);
    });
    it("correct logout", async () => {
      // log(user_1);
      let temp = JSON.parse(JSON.stringify(user_1));
      delete temp.nickname;

      let a = await server.post("/api/auth/logout").send(temp);
      expect(a.status).to.eql(204);
    });
    it("wrong refreshToken", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));
      delete temp.nickname;
      temp.refreshToken =
        "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNjYTY0Y2M1NjVjMjA1MzlkODJhY2EiLCJuaWNrbmFtZSI6InVzZXIxIiwiaWF0IjoxNTk3ODEwMjUyLCJleHAiOjE1OTg0MTUwNTJ9.FcBESGe13duFGHzerVCqwHzFvtFqZ-fxpIgdku7CJE";

      let a = await server.post("/api/auth/logout").send(temp);

      delete temp.refreshToken;
      let b = await server.post("/api/auth/logout").send(temp);
      // let c = await server.post('/api/auth/logout').send(temp);
      // logRes(a);
      // logRes(b);
      expect(a.status).to.eql(401);
      expect(b.status).to.eql(401);
    });
  });
  describe("POST /token", () => {
    beforeEach(async () => {
      user_1 = await regAndLogin(user_1);
    });
    it("correct request", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));
      // delete temp.nickname;

      let a = await server.post("/api/auth/token").send(temp);
      // logRes(a);
      expect(a.status).to.eql(200);
    });
    it("wrong refreshToken/inputs", async () => {
      let temp = JSON.parse(JSON.stringify(user_1));

      await server.post("/api/auth/logout").send(temp);
      let a = await server.post("/api/auth/token").send(temp);
      // logRes(a);
      expect(a.status).to.eql(401);

      delete temp.nickname;
      temp.refreshToken =
        "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNjYTY0Y2M1NjVjMjA1MzlkODJhY2EiLCJuaWNrbmFtZSI6InVzZXIxIiwiaWF0IjoxNTk3ODEwMjUyLCJleHAiOjE1OTg0MTUwNTJ9.FcBESGe13duFGHzerVCqwHzFvtFqZ-fxpIgdku7CJE";

      let b = await server.post("/api/auth/token").send(temp);
      // logRes(b);
      expect(b.status).to.eql(401);

      delete temp.refreshToken;
      let c = await server.post("/api/auth/token").send(temp);
      // logRes(c);
      expect(c.status).to.eql(401);
    });
  });
});
