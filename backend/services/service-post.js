const ReactionService = require("./service-reaction");
const mongoose = require("mongoose");
const ImageProc = require("../utils/image-proc");

let imageProc = new ImageProc();
const PAGE_SIZE = 1;
const HIT_SIZE = 0;

module.exports = class PostService extends (
  ReactionService
) {
  constructor(postModel, reactionModel) {
    super(reactionModel, postModel);
    this.Post = postModel;
  }

  getNum(num) {
    return !isNaN(num) && num > 1 ? num : PAGE_SIZE;
  }

  async removePostsByUID(uid) {
    const aggreDoc = await this.Post.aggregate([
      { $match: { "user._id": uid } },
      { $unwind: "$media" },
      { $group: { _id: 0, media: { $addToSet: "$media" } } },
    ]);

    await this.Post.deleteMany({ "user._id": uid });
    if (aggreDoc && aggreDoc[0]) {
      await imageProc.removeFiles(aggreDoc[0].media);
    }
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
    let postDoc = a.toJSON();
    await this._appendImagesToPost(postDoc);
    await super.appendReactionsGivenContents(user, [postDoc]);
    return postDoc;
  }

  async _appendImagesToPost(post) {
    post.media = await imageProc.getImgUrls(post.media);
    return post;
  }
  async _appendImagesToPosts(posts = []) {
    posts.forEach((post) => {
      post = this._appendImagesToPost(post);
    });
    await Promise.all(posts);
    return posts;
  }

  async removePost(user, postID) {
    let postToBeDeleted = await this.Post.findOneAndDelete({
      _id: postID,
      "user._id": user._id,
    });
    if (!postToBeDeleted) {
      throw new Error("user does not own the post or no such post exists");
    } else {
      await imageProc.removeFiles(postToBeDeleted.media);
    }
    // TODO: did not delete all reactions ???
    await super.deleteReactionsGivenContentIDs([postToBeDeleted]);
  }

  async updatePost(user, /* post */ postID, description = null, level = null) {
    if (!description && !level) {
      throw new Error("no input for either description or level");
    }
    let update = {};
    if (description) {
      update.description = description;
    }
    if (level) {
      update.level = level;
    }
    let updatedPost = await this.Post.findOneAndUpdate(
      {
        _id: postID,
        "user._id": user._id,
      },
      update,
      { new: true }
    );
    if (!updatedPost) {
      throw new Error("user does not own the post or no such post exists");
    }
    await this._appendImagesToPost(updatedPost);
    updatedPost = await super.appendReactionsGivenContents(user, [updatedPost]);
    return updatedPost[0];
  }

  async getPostByID(postID) {
    let postDoc = await this.Post.findOne({ _id: postID });
    return postDoc;
  }

  //
  //

  async getPosts(user, followers, lastCreatedAt = null, pageSize) {
    let ids = followers.map((x) => {
      return x.user._id;
    });

    let query = {
      $or: [
        {
          $and: [{ "user._id": { $in: ids } }, { level: { $ne: "private" } }],
        },
        { "user._id": user._id },
      ],
    };
    if (lastCreatedAt) {
      query.createdAt = { $lt: lastCreatedAt };
    }

    let posts;
    try {
      posts = await this.Post.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $limit: pageSize },
      ]);
    } catch (error) {
      log(error);
    }

    await this._appendImagesToPosts(posts);
    posts = await super.appendReactionsGivenContents(user, posts);
    return posts;
  }

  async getMyPosts(user, lastCreatedAt = null, pageSize = PAGE_SIZE) {
    let query = { "user._id": user._id };

    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    let posts = await this.Post.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();

    await this._appendImagesToPosts(posts);
    posts = await super.appendReactionsGivenContents(user, posts);

    return posts;
  }

  async getPublicPostsByUserID(
    user,
    requestedUserID,
    followingAndNPending = false,
    lastCreatedAt = null,
    pageSize = PAGE_SIZE
  ) {
    let viewLevels = ["public"];
    if (followingAndNPending) {
      viewLevels.push("followers");
    }

    let query = { "user._id": requestedUserID, level: { $in: viewLevels } };

    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    let posts = await this.Post.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();

    await this._appendImagesToPosts(posts);
    posts = await super.appendReactionsGivenContents(user, posts);

    return posts;
  }

  async getExplorePosts(user, lastReactionsCount = null, pageSize) {
    let lastHour = new Date();

    lastHour.setHours(lastHour.getHours() - 9000000);

    let query = {
      level: "public",
      createdAt: { $gt: lastHour },
      $and: [{ reactionsCount: { $gte: HIT_SIZE } }],
    };
    lastReactionsCount = parseInt(lastReactionsCount);

    if (lastReactionsCount && !isNaN(lastReactionsCount)) {
      query.$and = [
        ...query.$and,
        { reactionsCount: { $lt: lastReactionsCount } },
      ];
    }

    try {
      let posts = await this.Post.aggregate([
        { $match: query },
        { $sort: { reactionsCount: -1, createdAt: -1 } },
        // { $limit: 100 },
        { $limit: pageSize },
      ]);
      await this._appendImagesToPosts(posts);
      posts = await super.appendReactionsGivenContents(user, posts);
      return posts;
    } catch (error) {
      log(error);
    }
  }

  async postReaction(user, postID, reaction) {
    let post = await this.Post.findOne({ _id: postID });
    if (!post) {
      throw new Error("post does not exist");
    }
    let reactDoc = await super.postReaction(
      user,
      postID,
      [post.user._id, user._id],
      reaction
    );
    // if (this._condAppendDice(reactDoc.reactionsCount > HIT_SIZE)) {
    // }

    await this.reactionUpdate(reactDoc);

    return reactDoc;
  }

  async deleteReaction(user, postID) {
    let reactDoc = await super.deleteReaction(user, postID);
    // if (this._condAppendDice(reactDoc.reactionsCount < HIT_SIZE)) {
    // }
    await this.reactionUpdate(reactDoc);

    return reactDoc;
  }
  async reactionUpdate(reactDoc) {
    await this.Post.findOneAndUpdate(
      { _id: reactDoc._id },
      {
        reactions: reactDoc.reactions,
        reactionsCount: reactDoc.reactionsCount,
      },
      { new: true }
    );
  }
  _condAppendDice(cond) {
    return cond && ~~(Math.random() * HIT_SIZE) == 0;
  }
};
