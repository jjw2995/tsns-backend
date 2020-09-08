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
const os = require("os");

function modifyPictures(files) {
  return files.map((file) => {
    return new Promise((resolve, reject) => {
      jimp.read(file.path, (err, val) => {
        if (err) return reject(err);
        // log(file.path);
        val.contain(720, 720).quality(60).write(file.path);
        // log(val);
        resolve(file.path);
        // resolve(val);
      });
    });
  });
}

function uploadFile(filePath, dest) {
  return new Promise((resolve, reject) => {
    // log(dest);
    log(filePath);

    gcsBucket
      .upload(filePath, { destination: dest, public: false })
      .then((r) => {
        // log(r);
        resolve(r);
      })
      .catch((e) => {
        log(e);
        reject({ code: 500, message: "internal server error" });
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
  // log(files);

  return new Promise((resolve, reject) => {
    if (files.length > 4)
      return reject(new Error("cannot upload more than 4 pictures"));

    files = modifyPictures(files);
    Promise.all(files).then((r) => {
      files = r.map((path) => {
        return uploadFile(path, uuidv4() + ".png");
      });
      // log(files);
      Promise.all(files)
        .then((r) => {
          log("herererererere");

          r = r.map((file) => {
            log(file);
            // log(file[0].id);
            return file[0].id;
          });
          // log(r);
          resolve(r);
        })
        .catch((e) => {
          // log(e);
          reject(e);
        });
    });
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
        resolve(r);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

const PAGE_SIZE = 8;

module.exports = class PostService extends Reactionable {
  constructor(postModel) {
    // log(postModel);
    super(postModel);
    Post = postModel;
  }

  async addPost(user, post, files) {
    log("===================================");
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
    // log(res);
    return res;
  }

  async removePost(user, post) {
    let a = await Post.findOneAndDelete({
      _id: post._id,
      "user._id": user._id,
    });
    if (!a) {
      throw new Error("post is not yours or no such post exists");
    } else {
      await removeFiles(a.media);
    }
  }

  async updatePost(user, post) {
    let a = await Post.updateOne(
      {
        _id: post._id,
        "user._id": user._id,
      },
      {
        description: post.description,
        // media: post.media,
        level: post.level,
      }
    );
    if (a.n == 0) {
      throw new Error("post is not yours or no such user/post exists");
    }
    return;
  }

  // TODO: append users Reaction using super
  async getPosts(user, followers, pageSize = PAGE_SIZE) {
    let ids = followers.map((x) => {
      return x._id;
    });
    let q1 = { "user._id": { $in: ids } };
    let q2 = { level: { $ne: "private" } };

    let a = await Post.find({
      $or: [{ $and: [q1, q2] }, { "user._id": user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    return a;
  }

  async getMyPosts(user, pageSize = PAGE_SIZE) {
    let a = await Post.find({ "user._id": user._id })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();
    return a;
  }

  async getPublicPosts(pageSize = PAGE_SIZE) {
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

    let a = await Post.aggregate([
      { $match: matching },
      { $project: projecting },
      { $sort: { factor: -1 } },
      { $project: { factor: 0 } },
      { $limit: pageSize },
    ]);

    return a;
  }
};
