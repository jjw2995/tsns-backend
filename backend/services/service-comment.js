const mongoose = require("mongoose");
// const test = mongoose.model("Comment");
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

  async getPostComments(
    user,
    postID,
    lastComment = null,
    page_size = PAGE_SIZE
  ) {
    let query = { postID: postID, parentComID: null };
    if (lastComment) {
      query.createdAt = { $gt: new Date(lastComment.createdAt) };
    }
    let comments = await this.Comment.aggregate([
      { $match: query },
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

    let commentIDs = [];
    comments.forEach((comment) => {
      commentIDs.push(comment._id);
      comment.subComments.forEach((subComment) => {
        commentIDs.push(subComment._id);
      });
    });
    // log(commentIDs);
    // log(commentIDs.length);
    let reactionDocs = await super.getReactionsGivenContentIDs(
      user,
      commentIDs
    );
    // try {
    // } catch (e) {
    //   log(e);
    // }
    // log(reactionDocs);
    comments.forEach((comment) => {
      // commentIDs.push(comment._id);
      let reactionDoc = reactionDocs[comment._id];
      let reactions = reactionDoc.reactions;
      let userReaction = reactionDoc.userReaction;
      // comment.reactions = reactionDoc.reactions;
      // comment.userReaction = reactionDoc.userReaction;
      super.appendReaction(comment, reactions, userReaction);

      comment.subComments.forEach((subComment) => {
        let subReactionDoc = reactionDocs[subComment._id];
        // let reactionDoc = reactionDocs[comment._id];
        let subReactions = subReactionDoc.reactions;
        let subUserReaction = subReactionDoc.userReaction;
        // comment.reactions = reactionDoc.reactions;
        // comment.userReaction = reactionDoc.userReaction;
        super.appendReaction(subComment, subReactions, subUserReaction);
        // subComment.reactions = subReactionDoc.reactions;
        // subComment.userReaction = subReactionDoc.userReaction;

        // commentIDs.push(subComment._id);
      });
    });
    return comments;
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
