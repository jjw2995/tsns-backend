const { expect } = require("chai");

async function comment(user, postID, content, parentCom = null) {
  let payload = { postID: postID, content: user.nickname + "-" + content };
  if (parentCom) {
    payload.parentCom = parentCom;
  }
  let a = await server
    .post("/api/comments")
    .set(getAuthBear(user))
    .send(payload);
  // logRes(a);
  return a;
}

async function nSubcomComment(user, postID, content, parentCom, n = 1) {
  // for

  for (let i = 0; i < n; i++) {
    let payload = {
      postID: postID,
      content: user.nickname + "-" + content + " " + i,
      parentCom: parentCom,
    };

    let a = await server
      .post("/api/comments")
      .set(getAuthBear(user))
      .send(payload);
    // logRes(a);
  }
  return;
}

describe.only("/comments", () => {
  beforeEach(async () => {
    await userPrivPubFolPost(user_1);
    await userPrivPubFolPost(user_2);
    await userPrivPubFolPost(privateUser_1);
  });

  describe("POST", () => {
    it("comment subcomments", async () => {
      // log(user_1);
      let a = await comment(
        user_1,
        user_1.publicPostID,
        "main thread content 1"
      );
      // logRes(a);

      let b = await comment(
        user_2,
        user_1.publicPostID,
        "main thread content 2"
      );

      await comment(user_2, user_1.publicPostID, "main thread content 3");
      // await comment(user_2, user_1.publicPostID, "main thread content 4");

      await nSubcomComment(
        user_1,
        user_1.publicPostID,
        "subcomment",
        a.body,
        5
      );
      await nSubcomComment(
        privateUser_1,
        user_1.publicPostID,
        "subcomment",
        a.body,
        1
      );

      let z = await server
        .get("/api/comments")
        .set(getAuthBear(user_1))
        .send({ postID: user_1.publicPostID });
      // logRes(z);
      // log(z.body[0]);
    });

    // 코멘트 생성
    // 섭코멘트 생성
    // it("", async () => {});
  });
  // describe('/comments', () => {
  // 	describe('POST', () => {});
  // 	describe('DELETE', () => {});
  // 	describe('PATCH', () => {});

  describe("require comments and subcomments", () => {
    beforeEach("com subcoms setup", async () => {
      let a = await comment(
        user_1,
        user_1.publicPostID,
        "main thread content 1"
      );
      await comment(user_2, user_1.publicPostID, "main thread content 2");
      await comment(
        privateUser_1,
        user_1.publicPostID,
        "main thread content 3"
      );
      await nSubcomComment(
        user_1,
        user_1.publicPostID,
        "subcomment",
        a.body,
        5
      );
      await nSubcomComment(
        privateUser_1,
        user_1.publicPostID,
        "subcomment",
        a.body,
        1
      );
    });

    describe("GET", () => {
      it("get comments of a post, get next comments", async () => {
        let z = await server
          .get("/api/comments?num=2")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID });
        // logRes(z);
        expect(z.body.length).to.eql(2);

        let x = await server
          .get("/api/comments?num=2")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID, lastComment: z.body[0] });
        // logRes(x);
        expect(x.body.length).to.eql(2);
      });

      it("/subcomments - get all subcomments of a comment", async () => {
        let z = await server
          .get("/api/comments")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID });
        // logRes(z);

        let x = await server
          .get("/api/comments/subcomments?num=2")
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            lastComment: z.body[0].subcomments[2],
          });
        // logRes(x);
        expect(x.body.length).to.eql(2);

        let y = await server
          .get("/api/comments/subcomments?num=2")
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            lastComment: x.body[1],
          });
        // logRes(y);
        expect(y.body.length).to.eql(1);
      });
    });

    describe("DELETE", () => {
      it("delete a comment", async () => {
        let z = await server
          .get("/api/comments?num=2")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID });
        // logRes(z);
        // expect(z.body.length).to.eql(2);

        // log(z.body[0);

        let x = await server
          .delete("/api/comments")
          .set(getAuthBear(user_1))
          .send({ commentID: z.body[0]._id });
        // logRes(x);
        expect(x.body.n).to.eql(7);
      });

      it("delete a subcomment", async () => {
        let z = await server
          .get("/api/comments")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID });

        let x = await server
          .get("/api/comments/subcomments?num=5")
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            lastComment: z.body[0].subcomments[2],
          });
        // logRes(x);

        let toDeleteSubComID = x.body[0]._id;
        // log(toDeleteSubComID);

        let y = await server
          .delete("/api/comments")
          .set(getAuthBear(user_1))
          .send({
            commentID: toDeleteSubComID,
          });
        // logRes(y);
        expect(y.body.n).to.eql(1);

        x = await server
          .get("/api/comments/subcomments?num=5")
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            lastComment: z.body[0].subcomments[2],
          });
        let a = x.body.map((e) => {
          return e._id;
        });

        expect(a).to.not.contain(toDeleteSubComID);
      });

      it.only("delete a post, delete all comments", async () => {
        // it.only("delete a post, delete all comments", async () => {
        let a = await server
          .delete("/api/posts")
          .set(getAuthBear(user_1))
          .send({ postID: user_1.publicPostID });
        logRes(a);

        // let z = await server
        //   .get("/api/comments?num=2")
        //   .set(getAuthBear(user_1))
        //   .send({ postID: user_1.publicPostID });
        // logRes(z);
        //
        // expect(z.body.length).to.eql(2);

        // log(z.body[0);

        // let x = await server
        //   .delete("/api/posts")
        //   .set(getAuthBear(user_1))
        //   .send({ commentID: z.body[0]._id });
        // // logRes(x);
        // expect(x.body.n).to.eql(7);
      });
      //
    });
  });

  // 포스트 삭제(모든 코멘트 삭제)
});
