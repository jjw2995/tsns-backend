const Reactionable = require("./reactionable");
const mongoose = require("mongoose");
// const qwe = require('mongoose');.model('Post');

let log = (m) => console.log("\n", m, "\n");
let Post;

const { v4: uuidv4 } = require("uuid");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const gc = new Storage({
  keyFilename: path.join(__dirname, "../../gcs.json"),
  projectId: "clever-spirit-285705",
});

// for-tsns@clever-spirit-285705.iam.gserviceaccount.com
const gcsBucket = gc.bucket("tsns");
const jimp = require("jimp");
// const os = require("os");

function modifyPictures(files) {
  return files.map((file) => {
    return new Promise((resolve, reject) => {
      jimp.read(file.path, (err, val) => {
        if (err) {
          return reject(error(400, "file not of image-type"));
        }

        val.contain(720, 720).quality(60).write(file.path);
        resolve(file.path);
      });
    });
  });
}

function error(status, error) {
  return { status: status, error: error };
}

function uploadFile(filePath, dest) {
  return new Promise((resolve, reject) => {
    gcsBucket
      .upload(filePath, { destination: dest, public: false })
      .then((r) => {
        resolve(r);
      })
      .catch((e) => {
        log(e);
        reject(error(500, "internal server error"));
      });
  });
}

function removeFiles(media) {
  return new Promise((resolve, reject) => {
    media = media.map((id) => {
      return gcsBucket.file(id).delete();
    });
    Promise.all(media).then(() => {
      resolve();
    });
  });
}

function uploadFiles(files) {
  return new Promise((resolve, reject) => {
    if (files.length > 4) {
      return reject(error(400, "4 images max"));
    }

    files = modifyPictures(files);
    Promise.all(files)
      .then((r) => {
        files = r.map((path) => {
          return uploadFile(path, uuidv4() + ".png");
        });
        Promise.all(files)
          .then((r) => {
            r = r.map((file) => {
              return file[0].id;
            });
            resolve(r);
          })
          .catch((e) => {
            reject(e);
          });
      })
      .catch((e) => reject(e));
  });
}

const gcsUrl = "https://storage.cloud.google.com/tsns/";

function getImgUrls(media) {
  return new Promise((resolve, reject) => {
    let temp = media.map((id) => {
      return gcsBucket
        .file(id)
        .getSignedUrl({ expires: Date.now() + 7200000, action: "read" });
    });
    Promise.all(temp)
      .then((r) => {
        resolve(
          r.map((nested) => {
            return nested[0];
          })
        );
      })
      .catch((e) => {
        reject(e);
      });
  });
}

const PAGE_SIZE = 8;

module.exports = class PostService extends Reactionable {
  constructor(postModel, reactionModel) {
    super(postModel, reactionModel);
    Post = postModel;
  }

  async addPost(user, post, files) {
    let media = await uploadFiles(files);

    let _id = "p" + mongoose.Types.ObjectId();
    let a = await Post.create({
      _id,
      user,
      description: post.description,
      media: media,
      level: post.level,
    });
    let res = a.toJSON();
    res.media = await getImgUrls(media);
    super.appendReaction(res);
    // log(res);
    return res;
  }

  async removePost(user, postID) {
    log(postID);
    let a = await Post.findOneAndDelete({
      _id: postID,
      "user._id": user._id,
    });
    if (!a) {
      throw new Error("user does not own the post or no such post exists");
    } else {
      await removeFiles(a.media);
    }
    log(a);
  }

  async updatePost(user, post) {
    let updatedPost = await Post.findOneAndUpdate(
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

    let posts = await Post.find({
      $or: [{ $and: [q1, q2] }, { "user._id": user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    posts = await super.appendReqReactions(user, posts);
    return posts;
  }

  async getMyPosts(user, pageSize = PAGE_SIZE) {
    let posts = await Post.find({ "user._id": user._id })
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

    let posts = await Post.aggregate([
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
