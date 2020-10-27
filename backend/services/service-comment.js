const mongoose = require("mongoose");
const test = mongoose.model("Comment");
const Reactionable = require("./reactionable");

let log = (m) => console.log("\n", m, "\n");
let Comment;

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

const PAGE_SIZE = 8;
module.exports = class CommentService extends Reactionable {
  constructor(commentModel, reactionsModel) {
    super(commentModel, reactionsModel);
    Comment = commentModel;
  }

  async addComment(user, postID, content, parentCom = null) {
    let _id = "c" + mongoose.Types.ObjectId();
    // log("HIHHIHIHHI");
    // let comment = new t({ postID: postID, user: user, content: content })
    let comment = { _id: _id, postID: postID, user: user, content: content };
    if (parentCom) {
      if (parentCom.parentComID) {
        parentCom._id = parentCom.parentComID;
      }
      //   if (parentCom.postID != postID) {
      //     throw new Error("cannot leave subcomment on different post's comment");
      //   }
      //
      //   if (parentCom.numChild == 0) {
      let parentComment = await Comment.findOneAndUpdate(
        { _id: parentCom._id },
        { $inc: { numChild: 1 } },
        { new: true }
      ).lean();
      // log(parentComment);
      if (!parentComment) {
        throw new Error(`comment ${parentCom._id} has been removed`);
      }
      //   }
      comment.parentComID = parentCom._id;
    }

    let newComment = await Comment.create(comment);
    // log(newComment);
    return newComment;
  }

  async getPostComments(postID, lastComment = null, page_size = PAGE_SIZE) {
    // get all standalone comments
    let query = { postID: postID, parentComID: null };
    if (lastComment) {
      query.createdAt = { $gt: new Date(lastComment.createdAt) };
    }

    let a = await Comment.aggregate([
      { $match: query },
      // { $sort: { createdAt: -1 } },
      { $limit: parseInt(page_size) },
      {
        $lookup: {
          from: "Comment",
          as: "subcomments",
          let: { parentID: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$parentComID", "$$parentID"] } } },
            // { $sort: { createdAt: -1 } },
            { $limit: 3 },
          ],
        },
      },
    ]);
    return a;
  }

  async getSubComments(parentCommentID, lastComment, page_size = PAGE_SIZE) {
    let query = {
      parentComID: parentCommentID,
      createdAt: { $gt: lastComment.createdAt },
    };
    let subComments = await Comment.find(query).limit(parseInt(page_size));
    return subComments;
  }

  async removeCommentsOnPost(postID) {
    log(postID);
    let commentsToBeRemoved = await Comment.aggregate([
      { $match: { postID: postID } },
      { $project: { _id: "$_id" } },
    ]);
    commentsToBeRemoved = commentsToBeRemoved.map((comment) => {
      return comment._id;
    });
    log(commentsToBeRemoved);
    let a = await super.deleteReactions(commentsToBeRemoved);
    // del all comments
    // del all related reactions
    log("asfasdafasd");
    return a;
  }
  // remove get

  async removeComment(user, commentID) {
    let relatedComments = await Comment.aggregate([
      { $match: { $or: [{ _id: commentID }, { parentComID: commentID }] } },
      {
        $project: {
          _id: "$_id",
          user: "$user",
        },
      },
    ]);

    let toBeDeleted;

    relatedComments = relatedComments.map((comment) => {
      if (comment._id == commentID) {
        toBeDeleted = comment;
      }
      return comment._id;
    });

    // log(toBeDeleted);
    // log(relatedComments);

    if (toBeDeleted.user._id != user._id)
      throw Error(`${user.nickname} does not own comment with ${commentID}`);

    let deleted = await Comment.deleteMany({
      $or: [{ _id: commentID }, { parentComID: commentID }],
    });

    await super.deleteReactions(relatedComments);

    return deleted;
  }
};
