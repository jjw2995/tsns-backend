const Reactionable = require("./reactionable");
const mongoose = require("mongoose");
// const qwe = require('mongoose');.model('Post');
const ImageProc = require("./image-proc");

let log = (m) => console.log("\n", m, "\n");

let imageProc = new ImageProc();
const PAGE_SIZE = 8;

module.exports = class PostService extends Reactionable {
  constructor(postModel, reactionModel) {
    super(postModel, reactionModel);
    // postModel.find({}).then((r) => {
    //   log("HEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHERE");
    //   log(r);
    // });
    this.Post = postModel;
  }

  async addPost(user, post, files) {
    let media = await imageProc.uploadFiles(files);

    let _id = "p" + mongoose.Types.ObjectId();
    let a = await this.Post.create({
      _id,
      user,
      description: post.description,
      media: media,
      level: post.level,
    });
    let res = a.toJSON();
    res.media = await imageProc.getImgUrls(media);
    super.appendReaction(res);
    // log(res);
    return res;
  }

  async removePost(user, postID) {
    // log(Post);
    let a = await this.Post.findOneAndDelete({
      _id: postID,
      "user._id": user._id,
    });
    // log(a);
    if (!a) {
      throw new Error("user does not own the post or no such post exists");
    } else {
      await imageProc.removeFiles(a.media);
    }
  }

  async updatePost(user, post) {
    let updatedPost = await this.Post.findOneAndUpdate(
      {
        _id: post._id,
        "user._id": user._id,
      },
      {
        description: post.description,
        // media: post.media,
        level: post.level,
      },
      { new: true }
    );
    // console.log(updatedPost);
    if (!updatedPost) {
      throw new Error("user does not own the post or no such post exists");
    }
    updatedPost = await super.appendReqReactions(user, [updatedPost]);
    // console.log(updatedPost);
    return updatedPost[0];
  }

  async getPosts(user, followers, pageSize = PAGE_SIZE) {
    let ids = followers.map((x) => {
      return x._id;
    });
    let q1 = { "user._id": { $in: ids } };
    let q2 = { level: { $ne: "private" } };

    let posts = await this.Post.find({
      $or: [{ $and: [q1, q2] }, { "user._id": user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    posts = await super.appendReqReactions(user, posts);
    return posts;
  }

  async getMyPosts(user, pageSize = PAGE_SIZE) {
    let posts = await this.Post.find({ "user._id": user._id })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    posts = await super.appendReqReactions(user, posts);

    return posts;
  }

  async getPublicPosts(user, pageSize = PAGE_SIZE) {
    let lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    let matching = {
      level: "public",
      createdAt: { $gt: lastHour },
    };

    let factoring = {
      $add: [
        "$reactions.love",
        "$reactions.haha",
        "$reactions.sad",
        "$reactions.angry",
      ],
    };
    let projecting = {
      user: 1,
      description: 1,
      media: 1,
      level: 1,
      reactions: 1,
      createdAt: 1,
      updatedAt: 1,
      factor: factoring,
    };

    let posts = await this.Post.aggregate([
      { $match: matching },
      { $project: projecting },
      { $sort: { factor: -1 } },
      { $project: { factor: 0 } },
      { $limit: pageSize },
    ]);

    posts = await super.appendReqReactions(user, posts);
    return posts;
  }
  // appendReqReactions() {}

  async postReaction(user, postID, reaction) {
    let reactDoc = await super.postReaction(user, postID, reaction);

    return reactDoc;
  }
};
