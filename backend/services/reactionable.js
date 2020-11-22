// const { update } = require("../db/db-reaction");

const EMOTIONS = ["love", "haha", "sad", "angry"];
const REACTIONSINIT = { love: 0, haha: 0, sad: 0, angry: 0 };

module.exports = class Reactionable {
  constructor(contentModel, reactionModel) {
    this.Content = contentModel;
    this.Reaction = reactionModel;
  }

  _checkReaction(reaction) {
    if (!EMOTIONS.includes(reaction)) {
      throw new Error("reaction is not one of love, haha, sad, and angry");
    }
  }

  async postReaction(user, contentID, reaction) {
    this._checkReaction(reaction);

    await this.Reaction.findOneAndUpdate(
      {
        contentID: contentID,
        "user._id": user._id,
      },
      // reactionObj(contentID, user, reaction),
      { reaction: reaction, user: user, contentID: contentID },
      { upsert: true }
    );

    let content = { _id: contentID };
    let contents = [content];

    let reactions = this.appendReactionsGivenContents(user, contents);

    return reactions;
  }

  async appendReactionsGivenContents(user, contents = []) {
    // log(contents);
    let reactionsObj = {};
    let contentIDs = contents.map((content) => {
      // content.userReaction = null;
      reactionsObj[content._id] = this.reactionObjInit();
      return content._id;
    });
    // log(reactionsObj);

    let docsAggregatedByCIDandReaction = await this.Reaction.aggregate([
      { $match: { contentID: { $in: contentIDs } } },
      {
        $group: {
          _id: { contentID: "$contentID", reaction: "$reaction" },
          count: { $sum: 1 },
          userReaction: {
            $push: {
              $cond: [
                { $eq: ["$user._id", user._id] },
                "$reaction",
                "$$REMOVE",
                // null,
              ],
            },
          },
        },
      },
    ]);

    docsAggregatedByCIDandReaction.forEach((uniqueCIDandReaction) => {
      let contentID = uniqueCIDandReaction._id.contentID;
      let reaction = uniqueCIDandReaction._id.reaction;
      let reactionCount = uniqueCIDandReaction.count;
      let userReaction = uniqueCIDandReaction.userReaction[0];
      // log(reactionsObj[contentID].reactions[`${reaction}`]);
      reactionsObj[contentID].reactions[`${reaction}`] = reactionCount;

      if (userReaction) {
        reactionsObj[contentID].userReaction = userReaction;
      }
    });
    // contents;
    // contents =
    contents.forEach((content) => {
      content.reactions = reactionsObj[content._id].reactions;
      content.userReaction = reactionsObj[content._id].userReaction;
      // return content;
    });

    return contents;
  }

  async getReactionsGivenContentIDs(user, contentIDs = []) {
    // log(contents);
    // log(user);
    // log(contentIDs);
    let reactionsObj = {};
    contentIDs.forEach((contentID) => {
      reactionsObj[contentID] = this.reactionObjInit();
    });
    // log(reactionsObj);

    let docsAggregatedByCIDandReaction = await this.Reaction.aggregate([
      { $match: { contentID: { $in: contentIDs } } },
      {
        $group: {
          _id: { contentID: "$contentID", reaction: "$reaction" },
          count: { $sum: 1 },
          userReaction: {
            $push: {
              $cond: [
                { $eq: ["$user._id", user._id] },
                "$reaction",
                "$$REMOVE",
                // null,
              ],
            },
          },
        },
      },
    ]);

    docsAggregatedByCIDandReaction.forEach((uniqueCIDandReaction) => {
      let contentID = uniqueCIDandReaction._id.contentID;
      let reaction = uniqueCIDandReaction._id.reaction;
      let reactionCount = uniqueCIDandReaction.count;
      let userReaction = uniqueCIDandReaction.userReaction[0];
      // log(reactionsObj[contentID].reactions[`${reaction}`]);
      reactionsObj[contentID].reactions[`${reaction}`] = reactionCount;

      if (userReaction) {
        reactionsObj[contentID].userReaction = userReaction;
      }
    });
    // log(reactionsObj);
    return reactionsObj;
  }

  async deleteReactionsGivenContentIDs(contentIDs) {
    // log(contentIDs);
    let a = await this.Reaction.deleteMany({ contentID: { $in: contentIDs } });
    // log(a);
  }

  reactionObjInit() {
    return { reactions: REACTIONSINIT, userReaction: null };
  }

  appendReaction(contentRef, reactions, userReaction = null) {
    contentRef.userReaction = userReaction;
    contentRef.reactions = reactions;
  }

  // let reactionDoc = reactionDocs[comment._id];
  // comment.reactions = reactionDoc.reactions;
  // comment.userReaction = reactionDoc.userReaction;
};
