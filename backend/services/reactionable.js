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

    let reactions = await this.appendReactionsGivenContents(user, contents);

    return reactions[0];
  }

  async deleteReaction(user, contentID) {
    let a = await this.Reaction.findOneAndDelete({
      contentID: contentID,
      "user._id": user._id,
    });

    let content = { _id: contentID };
    let contents = [content];

    let reactions = await this.appendReactionsGivenContents(user, contents);

    return reactions[0];
  }

  async appendReactionsGivenContents(user, contents = []) {
    let ContentIDsToReactions = {};
    let contentIDs = contents.map((content) => {
      ContentIDsToReactions[content._id] = this.reactionObjInit();
      return content._id;
    });

    let aggregatedByContentIDandReaction = await this.aggregatedByContentIDandReaction(
      user,
      contentIDs
    );

    ContentIDsToReactions = this.mapReactionsToContentIDs(
      aggregatedByContentIDandReaction,
      ContentIDsToReactions
    );

    contents.forEach((content) => {
      content.reactions = ContentIDsToReactions[content._id].reactions;
      content.reactionsCount = Object.values(content.reactions).reduce(
        (a, c) => a + c
      );
      // log(ContentIDsToReactions[content._id].userReaction);
      content.userReaction = ContentIDsToReactions[content._id].userReaction;
    });

    return contents;
  }

  async getReactionsGivenContentIDs(user, contentIDs = []) {
    let ContentIDsToReactions = {};
    contentIDs.forEach((contentID) => {
      ContentIDsToReactions[contentID] = this.reactionObjInit();
    });

    let aggredByCIDandReaction = await this.aggregatedByContentIDandReaction(
      user,
      contentIDs
    );

    ContentIDsToReactions = this.mapReactionsToContentIDs(
      aggredByCIDandReaction,
      ContentIDsToReactions
    );

    return ContentIDsToReactions;
  }

  aggregatedByContentIDandReaction(user, contentIDs) {
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

  mapReactionsToContentIDs(aggredByCIDandReaction, ContentIDsToReactions) {
    aggredByCIDandReaction.forEach((uniqueCIDandReaction) => {
      let contentID = uniqueCIDandReaction._id.contentID;
      let reaction = uniqueCIDandReaction._id.reaction;
      let reactionCount = uniqueCIDandReaction.count;
      let userReaction = uniqueCIDandReaction.userReaction[0];

      ContentIDsToReactions[contentID].reactions[`${reaction}`] = reactionCount;
      if (userReaction) {
        ContentIDsToReactions[contentID].userReaction = userReaction;
      }
    });
    return ContentIDsToReactions;
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
