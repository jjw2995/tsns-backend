// const { expect } = require("chai");

async function comment(user, postID, content, parentCom = null) {
  let payload = { postID: postID, content: user.nickname + "-" + content };
  if (parentCom) {
    payload.parentComID = parentCom._id;
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
      parentComID: parentCom._id,
    };

    let a = await server
      .post("/api/comments")
      .set(getAuthBear(user))
      .send(payload);
    // logRes(a);
  }
  return;
}

describe("/comments", () => {
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
      // log(user_1);
      expect(a.body.user._id).to.eql(user_1._id);
      expect(a.body.postID).to.eql(user_1.publicPostID);

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
      // log(z.body[0].subComments);
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
          .get(`/api/comments/${user_1.publicPostID}?num=2`)
          .set(getAuthBear(user_1));
        // .send({ postID: user_1.publicPostID });
        // logRes(z);
        expect(z.body.length).to.eql(2);

        let x = await server
          // !!!!!!
          .get(
            `/api/comments/${user_1.publicPostID}?num=2&last-created-at=${z.body[0].createdAt}`
          )
          .set(getAuthBear(user_1));
        // logRes(x);
        expect(x.body.length).to.eql(2);
      });

      it("/subcomments - get all subcomments of a comment", async () => {
        let z = await server
          .get(`/api/comments/${user_1.publicPostID}`)
          .set(getAuthBear(user_1));
        // logRes(z);
        // log(z.body[0].subComments);
        let date = z.body[0].subComments[2].createdAt;

        let x = await server
          // !!!!!!
          .get(
            `/api/comments/subcomments/${z.body[0]._id}?num=2&last-created-at=${date}`
          )
          .set(getAuthBear(user_1));
        // logRes(x);
        expect(x.body.length).to.eql(2);
        date = x.body[1].createdAt;

        let y = await server
          // !!!!!!
          .get(
            `/api/comments/subcomments/${z.body[0]._id}?num=2&last-created-at=${date}`
          )
          .set(getAuthBear(user_1));
        // logRes(y);
        expect(y.body.length).to.eql(1);
      });
    });

    describe("DELETE", () => {
      it("delete a comment", async () => {
        let z = await server
          // !!!!!!
          .get(`/api/comments/${user_1.publicPostID}?num=2`)
          .set(getAuthBear(user_1));

        let a = await Comment.find();
        // log(a.length);
        expect(a.length).to.eql(9);

        // log(z.body[0);

        let x = await server
          .delete(`/api/comments/${z.body[0]._id}`)
          .set(getAuthBear(user_1));
        // logRes(x);
        expect(x.status).to.eql(204);
        a = await Comment.find();
        // log(a.length);
        expect(a.length).to.eql(2);
      });

      it("delete a subcomment", async () => {
        let z = await server
          .get(`/api/comments/${user_1.publicPostID}`)
          .set(getAuthBear(user_1));
        // .send({ postID: user_1.publicPostID });
        // logRes(z);
        let x = await server
          .get(
            `/api/comments/subcomments/${z.body[0]._id}?num=5&last-created-at=${z.body[0].subComments[2].createdAt}`
          )
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            // last-created-at: z.body[0].subComments[2].createdAt,
          });
        // logRes(x);

        let toDeleteSubComID = x.body[0]._id;
        // log(toDeleteSubComID);
        let a = await Comment.find();
        expect(a.length).to.eql(9);

        let y = await server
          .delete(`/api/comments/${toDeleteSubComID}`)
          .set(getAuthBear(user_1))
          .send({
            commentID: toDeleteSubComID,
          });
        // logRes(y);
        a = await Comment.find();
        expect(a.length).to.eql(8);

        x = await server
          .get(
            `/api/comments/subcomments/${z.body[0]._id}?num=5&last-created-at=${z.body[0].subComments[2].createdAt}`
          )
          .set(getAuthBear(user_1))
          .send({
            parentCommentID: z.body[0]._id,
            // last-created-at: z.body[0].subComments[2].createdAt,
          });
        // logRes(x);
        a = x.body.map((e) => {
          return e._id;
        });

        expect(a).to.not.contain(toDeleteSubComID);
      });

      // it("delete a post, delete all comments", async () => {
      //   // let d = await Reaction.find({});
      //   // log(d);
      //   // expect(d.length).to.eql(0);

      //   d = await Comment.find({ postID: user_1.publicPostID });
      //   log(d);
      //   // expect(d.length).to.eql(0);

      //   // let d = await Reaction.find({});
      //   // // log(d);
      //   // expect(d.length).to.eql(0);

      //   let a = await server
      //     .delete("/api/posts" + `${user_1.publicPostID}`)
      //     .set(getAuthBear(user_1));
      //   // .send({ postID: user_1.publicPostID });
      //   logRes(a);
      //   let b = await Post.findById(user_1.publicPostID);
      //   expect(b).to.eql(null);

      //   let z = await server
      // !!!!!!
      //     .get("/api/comments?num=2")
      //     .set(getAuthBear(user_1))
      //     .send({ postID: user_1.publicPostID });
      //   // logRes(z);

      //   expect(z.body.length).to.eql(0);
      // });
      // //
    });

    describe("/react", () => {
      describe("POST", () => {
        it("react to comment", async () => {
          let comments = await server
            .get(`/api/comments/${user_1.publicPostID}`)
            .set(getAuthBear(user_1));
          // .send({ postID: user_1.publicPostID });
          comments = comments.body;
          // log(comments[0]);

          let a = await server
            .post(`/api/comments/react`)
            .set(getAuthBear(user_2))
            .send({ commentID: comments[0]._id, reaction: "haha" });
          // logRes(a);
          expect(a.body.reactions.haha).to.eql(1);

          // comments = await server
          //   .get("/api/comments")
          //   .set(getAuthBear(user_1))
          //   .send({ postID: user_1.publicPostID });
          // comments = comments.body;
          // log(comments);
        });
      });
      describe("DELETE", () => {
        it("delete reaction to a comment", async () => {
          let comments = await server
            .get(`/api/comments/${user_1.publicPostID}`)
            .set(getAuthBear(user_1));
          // .send({ postID: user_1.publicPostID });
          comments = comments.body;
          // log(comments[0]);

          let a = await server
            .post(`/api/comments/react`)
            .set(getAuthBear(user_2))
            .send({ commentID: comments[0]._id, reaction: "haha" });
          // logRes(a);
          expect(a.body.reactions.haha).to.eql(1);
          let b = await Reaction.find({});
          // log(b);
          expect(b.length).to.eql(1);

          a = await server
            .delete(`/api/comments/react/${a.body._id}`)
            .set(getAuthBear(user_2));
          // .send({ commentID: comments[0]._id, reaction: "haha" });
          // logRes(a);
          comments = await server
            .get(`/api/comments/${user_1.publicPostID}`)
            .set(getAuthBear(user_1));
          // .send({ postID: user_1.publicPostID });
          comments = comments.body;
          // log(comments);
          expect(comments[0].reactions.haha).to.eql(0);
          b = await Reaction.find({});
          // log(b);
          expect(b.length).to.eql(0);
        });
      });
    });
  });
});
