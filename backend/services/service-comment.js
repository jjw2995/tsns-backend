const mongoose = require("mongoose");
const test = mongoose.model("Comment");
const Reactionable = require("./reactionable");

const PAGE_SIZE = 8;
module.exports = class CommentService extends Reactionable {
  constructor(commentModel, reactionsModel) {
    super(commentModel, reactionsModel);
    this.Comment = commentModel;
  }

  async addComment(user, postID, content, parentCom = null) {
    let _id = "c" + mongoose.Types.ObjectId();
    let comment = { _id: _id, postID: postID, user: user, content: content };
    if (parentCom) {
      if (parentCom.parentComID) {
        parentCom._id = parentCom.parentComID;
      }
      let parentComment = await this.Comment.findOneAndUpdate(
        { _id: parentCom._id },
        { $inc: { numChild: 1 } },
        { new: true }
      ).lean();
      if (!parentComment) {
        throw new Error(`comment ${parentCom._id} has been removed`);
      }
      comment.parentComID = parentCom._id;
    }

    let newComment = await this.Comment.create(comment);
    return newComment;
  }

  async getPostComments(postID, lastComment = null, page_size = PAGE_SIZE) {
    let query = { postID: postID, parentComID: null };
    if (lastComment) {
      query.createdAt = { $gt: new Date(lastComment.createdAt) };
    }
    let a = await this.Comment.aggregate([
      { $match: query },
      { $limit: parseInt(page_size) },
      {
        $lookup: {
          from: "Comment",
          as: "subcomments",
          let: { parentID: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$parentComID", "$$parentID"] } } },
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
    let subComments = await this.Comment.find(query).limit(parseInt(page_size));
    return subComments;
  }

  async removeCommentsOnPost(postID) {
    let commentsToBeRemoved = await this.Comment.aggregate([
      { $match: { postID: postID } },
      { $project: { _id: "$_id" } },
    ]);
    commentsToBeRemoved = commentsToBeRemoved.map((comment) => {
      return comment._id;
    });
    await this.Comment.deleteMany({ _id: { $in: commentsToBeRemoved } });
    let a = await super.deleteReactions(commentsToBeRemoved);
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

    await super.deleteReactions(relatedComments);

    return deleted;
  }
};
