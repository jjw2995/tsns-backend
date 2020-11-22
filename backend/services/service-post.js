const Reactionable = require("./reactionable");
const mongoose = require("mongoose");
const ImageProc = require("../utils/image-proc");

let imageProc = new ImageProc();
const PAGE_SIZE = 8;

module.exports = class PostService extends Reactionable {
  constructor(postModel, reactionModel) {
    super(postModel, reactionModel);
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
    await super.appendReactionsGivenContents(user, [res]);
    // log(res);
    return res;
  }

  async removePost(user, postID) {
    let postToBeDeleted = await this.Post.findOneAndDelete({
      _id: postID,
      "user._id": user._id,
    });
    if (!postToBeDeleted) {
      throw new Error("user does not own the post or no such post exists");
    } else {
      // log(postToBeDeleted);
      await imageProc.removeFiles(postToBeDeleted.media);
    }
    // log(postToBeDeleted);
    await super.deleteReactionsGivenContentIDs([postToBeDeleted]);
  }

  async updatePost(user, post) {
    let updatedPost = await this.Post.findOneAndUpdate(
      {
        _id: post._id,
        "user._id": user._id,
      },
      {
        description: post.description,
        level: post.level,
      },
      { new: true }
    );
    if (!updatedPost) {
      throw new Error("user does not own the post or no such post exists");
    }
    updatedPost = await super.appendReactionsGivenContents(user, [updatedPost]);
    return updatedPost[0];
  }

  async getPostByID(postID) {
    let postDoc = await this.Post.findOne({ _id: postID });
    return postDoc;
  }
  async getPosts(user, followers, pageSize = PAGE_SIZE) {
    let ids = followers.map((x) => {
      return x._id;
    });
    // let q1 = { "user._id": { $in: ids } };
    // let q2 = { level: { $ne: "private" } };

    let posts = await this.Post.find({
      $or: [
        { $and: [{ "user._id": { $in: ids } }, { level: { $ne: "private" } }] },
        { "user._id": user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    // log("here");
    // log(posts);
    posts = await super.appendReactionsGivenContents(user, posts);
    // log(posts);
    return posts;
  }

  async getMyPosts(user, pageSize = PAGE_SIZE) {
    let posts = await this.Post.find({ "user._id": user._id })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    // log(posts);
    posts = await super.appendReactionsGivenContents(user, posts);

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

    posts = await super.appendReactionsGivenContents(user, posts);
    return posts;
  }

  async postReaction(user, postID, reaction) {
    let reactDoc = await super.postReaction(user, postID, reaction);

    return reactDoc[0];
  }
};
