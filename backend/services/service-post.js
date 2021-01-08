const ReactionService = require("./service-reaction");
const mongoose = require("mongoose");
const ImageProc = require("../utils/image-proc");
// const { post } = require("../routes/api/route-post");

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

  removePostsByUID(uid) {
    return new Promise((resolve, reject) => {
      this.Post.deleteMany({ "user._id": uid })
        .then((r) => {
          resolve();
        })
        .catch((e) => reject(e));
    });
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
  //

  async getPosts(user, followers, lastCreatedAt = null, pageSize) {
    let ids = followers.map((x) => {
      // return mongoose.Types.ObjectId(x.user._id);
      return x.user._id;
    });
    // log(ids);

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
      // log("here");
    } catch (error) {
      log(error);
    }

    await this._appendImagesToPosts(posts);
    posts = await super.appendReactionsGivenContents(user, posts);
    return posts;
  }

  async getMyPosts(user, lastCreatedAt = null, pageSize = PAGE_SIZE) {
    // console.log(lastCreatedAt);
    let query = { "user._id": user._id };

    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    let posts = await this.Post.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    // log(posts);

    await this._appendImagesToPosts(posts);
    posts = await super.appendReactionsGivenContents(user, posts);

    return posts;
  }

  async getPostsByUserID(
    user,
    requestedUserID,
    isFollowing = false,
    lastCreatedAt = null,
    pageSize = PAGE_SIZE
  ) {
    let viewLevels = ["public"];
    if (isFollowing) {
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

  // 이거
  async getExplorePosts(user, lastReactionsCount = null, pageSize) {
    let lastHour = new Date();

    lastHour.setHours(lastHour.getHours() - 90000);

    let query = {
      level: "public",
      createdAt: { $gt: lastHour },
      $and: [{ reactionsCount: { $gte: HIT_SIZE } }],
    };
    lastReactionsCount = parseInt(lastReactionsCount);

    console.log(lastReactionsCount);
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

  // let query = {
  //   level: "public",
  // };
  // if (lastCreatedAt) {
  //   query.createdAt = { $lt: new Date(lastCreatedAt) };
  // }

  //
  //

  // let factoring = {
  //   $add: [
  //     "$reactions.love",
  //     "$reactions.haha",
  //     "$reactions.sad",
  //     "$reactions.angry",
  //   ],
  // };
  // let projecting = {
  //   user: 1,
  //   description: 1,
  //   media: 1,
  //   level: 1,
  //   reactions: 1,
  //   createdAt: 1,
  //   updatedAt: 1,
  //   factor: factoring,
  // };
  // let posts = await this.Post.aggregate([
  //   { $project: projecting },
  //   { $match: query },
  //   { $match: { factor: { $gte: 0 } } },
  //   { $sort: { factor: -1 } },
  //   // { $sort: { factor: -1, createdAt: -1 } },
  //   // { $sort: { createdAt: -1 } },
  //   { $limit: pageSize },
  //   // { $project: { factor: 0 } },
  // ]);

  async postReaction(user, postID, reaction) {
    let post = await this.Post.findOne({ _id: postID });
    if (!post) {
      throw new Error("post does not exist");
    }
    let reactDoc = await super.postReaction(
      user,
      commentID,
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
    // log("in reactionUpdate, reactDoc");
    // log(reactDoc);
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
    // console.log(
    //   "in _condAppendDice,",
    //   cond && ~~(Math.random() * HIT_SIZE) == 0
    // );
    return cond && ~~(Math.random() * HIT_SIZE) == 0;
  }
};
