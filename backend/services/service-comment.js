const mongoose = require("mongoose");
// const test = mongoose.model("Comment");
const Reactionable = require("./reactionable");

const PAGE_SIZE = 8;
module.exports = class CommentService extends (
  Reactionable
) {
  constructor(commentModel, reactionsModel) {
    super(commentModel, reactionsModel);
    this.Comment = commentModel;
  }

  async addComment(user, postID, content, parentComID = null) {
    // log(parentComID)
    let _id = "c" + mongoose.Types.ObjectId();
    let comment = { _id: _id, postID: postID, user: user, content: content };
    if (parentComID) {
      // if (parentCom.parentComID) {
      //   parentCom._id = parentCom.parentComID;
      // }
      let parentComment = await this.Comment.findOneAndUpdate(
        { _id: parentComID },
        { $inc: { numChild: 1 } },
        { new: true }
      ).lean();
      if (!parentComment) {
        throw new Error(`comment ${parentComID} has been removed`);
      }
      comment.parentComID = parentComID;
    }

    let newComment = await this.Comment.create(comment);
    return newComment;
  }

  async postReaction(user, commentID, reaction) {
    let reactDoc = await super.postReaction(user, commentID, reaction);
    // if (kFaceDiceEqlOne(HIT_SIZE)) {
    //   // let a =
    //   await this.Post.findOneAndUpdate(
    //     { _id: commentID },
    //     { reactions: reactDoc[0].reactions },
    //     { new: true }
    //   );
    //   // log(a);
    // }
    // log(reactDoc);

    return reactDoc;
  }

  async deleteReaction(user, commentID) {
    let reactDoc = await super.deleteReaction(user, commentID);

    return reactDoc;
  }

  async getPostComments(
    user,
    postID,
    lastCreatedAt = null,
    page_size = PAGE_SIZE
  ) {
    let query = { postID: postID, parentComID: null };
    if (lastCreatedAt) {
      query.createdAt = { $gt: new Date(lastCreatedAt) };
    }
    let comments = await this.Comment.aggregate([
      { $match: query },
      // { $sort: { createdAt: -1 } },
      { $limit: parseInt(page_size) },
      {
        $lookup: {
          from: "Comment",
          as: "subComments",
          let: { parentID: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$parentComID", "$$parentID"] } } },
            { $limit: 3 },
          ],
        },
      },
    ]);
    comments = await this.commentsAppendReaction(user, comments);

    return comments;
  }

  async getSubComments(
    user,
    parentCommentID,
    lastCreatedAt,
    page_size = PAGE_SIZE
  ) {
    let query = {
      parentComID: parentCommentID,
      createdAt: { $gt: lastCreatedAt },
    };
    let subComments = await this.Comment.find(query)
      .limit(parseInt(page_size))
      .lean();

    subComments = await this.commentsAppendReaction(user, subComments);
    // log(reactionDocs);
    return subComments;
  }

  async commentsAppendReaction(user, comments) {
    let commentIDs = [];

    comments.forEach((comment) => {
      commentIDs.push(comment._id);
      if (comment.subComments) {
        comment.subComments.forEach((subComment) => {
          commentIDs.push(subComment._id);
        });
      }
    });

    let reactionDocs = await super.getReactionsGivenContentIDs(
      user,
      commentIDs
    );

    comments.forEach((comment) => {
      let reactionDoc = reactionDocs[comment._id];

      super.appendReaction(
        comment,
        reactionDoc.reactions,
        reactionDoc.userReaction
      );
      if (comment.subComments) {
        comment.subComments.forEach((subComment) => {
          let subCommentReactionDoc = reactionDocs[subComment._id];

          super.appendReaction(
            subComment,
            subCommentReactionDoc.reactions,
            subCommentReactionDoc.userReaction
          );
        });
      }
    });
    return comments;
  }

  async removeCommentsOnPost(postID) {
    let commentIDsToBeRemoved = await this.Comment.aggregate([
      { $match: { postID: postID } },
      { $project: { _id: "$_id" } },
    ]);
    commentIDsToBeRemoved = commentIDsToBeRemoved.map((comment) => {
      return comment._id;
    });
    // log(commentIDsToBeRemoved);
    await this.Comment.deleteMany({ _id: { $in: commentIDsToBeRemoved } });
    let a = await super.deleteReactionsGivenContentIDs(commentIDsToBeRemoved);
    return a;
  }

  async removeComment(user, commentID) {
    let relatedComments = await this.Comment.aggregate([
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

    if (toBeDeleted.user._id != user._id)
      throw Error(`${user.nickname} does not own comment with ${commentID}`);

    let deleted = await this.Comment.deleteMany({
      $or: [{ _id: commentID }, { parentComID: commentID }],
    });

    await super.deleteReactionsGivenContentIDs(relatedComments);

    return deleted;
  }
};
