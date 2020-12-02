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

    let a = await this.Reaction.findOneAndUpdate(
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

  async deleteReaction(user, contentID) {
    let a = await this.Reaction.findOneAndDelete({
      contentID: contentID,
      "user._id": user._id,
    });

    let content = { _id: contentID };
    let contents = [content];

    let reactions = this.appendReactionsGivenContents(user, contents);

    return reactions;
  }

  async appendReactionsGivenContents(user, contents = []) {
    let CIDsToReactions = {};
    let contentIDs = contents.map((content) => {
      CIDsToReactions[content._id] = this.reactionObjInit();
      return content._id;
    });
    // log(CIDsToReactions);
    // log(user);

    let aggredByCIDandReaction = await this.aggregateCountByCidAndReaction(
      user,
      contentIDs
    );
    // log(aggredByCIDandReaction);

    CIDsToReactions = this.mapReactionsToContentIDs(
      aggredByCIDandReaction,
      CIDsToReactions
    );

    contents.forEach((content) => {
      content.reactions = CIDsToReactions[content._id].reactions;
      // log(CIDsToReactions[content._id].userReaction);
      content.userReaction = CIDsToReactions[content._id].userReaction;
      // content.d = 1;
      // log(content);
    });
    // log(contents);

    return contents;
  }

  async getReactionsGivenContentIDs(user, contentIDs = []) {
    let CIDsToReactions = {};
    contentIDs.forEach((contentID) => {
      CIDsToReactions[contentID] = this.reactionObjInit();
    });

    let aggredByCIDandReaction = await this.aggregateCountByCidAndReaction(
      user,
      contentIDs
    );

    CIDsToReactions = this.mapReactionsToContentIDs(
      aggredByCIDandReaction,
      CIDsToReactions
    );

    return CIDsToReactions;
  }

  aggregateCountByCidAndReaction(user, contentIDs) {
    return this.Reaction.aggregate([
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
  }

  mapReactionsToContentIDs(aggredByCIDandReaction, CIDsToReactions) {
    aggredByCIDandReaction.forEach((uniqueCIDandReaction) => {
      let contentID = uniqueCIDandReaction._id.contentID;
      let reaction = uniqueCIDandReaction._id.reaction;
      let reactionCount = uniqueCIDandReaction.count;
      let userReaction = uniqueCIDandReaction.userReaction[0];

      CIDsToReactions[contentID].reactions[`${reaction}`] = reactionCount;
      if (userReaction) {
        CIDsToReactions[contentID].userReaction = userReaction;
      }
    });
    return CIDsToReactions;
  }

  async deleteReactionsGivenContentIDs(contentIDs) {
    // log(contentIDs);
    let a = await this.Reaction.deleteMany({ contentID: { $in: contentIDs } });
    // log(a);
  }

  reactionObjInit() {
    return JSON.parse(
      JSON.stringify({ reactions: REACTIONSINIT, userReaction: null })
    );
  }

  appendReaction(contentRef, reactions, userReaction = null) {
    contentRef.userReaction = userReaction;
    contentRef.reactions = reactions;
  }

  // let reactionDoc = reactionDocs[comment._id];
  // comment.reactions = reactionDoc.reactions;
  // comment.userReaction = reactionDoc.userReaction;
};
