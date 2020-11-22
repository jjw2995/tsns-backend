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

    let reactionDoc = await this.Reaction.findOneAndUpdate(
      {
        contentID: contentID,
        "user._id": user._id,
      },
      reactionObj(contentID, user, reaction),
      { upsert: true }
    );
    let content = { _id: contentID };
    let contents = [content];

    log(contents);
    log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    let reactions = await this.appendReactionsGivenContents(user, contents);
    // return reactions;
    // log(content);
    // log(contents);

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
    log(reactionsObj);

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
    // log("HEREHEREHEREHEREHEREHEREHEREHEREHEREHERE");

    log(docsAggregatedByCIDandReaction);
    docsAggregatedByCIDandReaction.forEach((elem) => {
      log(elem);
      let contentID = elem._id.contentID;
      let reaction = elem._id.reaction;

      log("herer");
      log(contentID);
      // reactionsObj[]

      // reactionsObj[contentID].reactionCounts[`${reaction}`] = elem.count;
      // if (elem.userReaction.length) {
      //   reactionsObj[contentID].userReaction = elem.userReaction[0];
      // }
    });
    log(reactionsObj);

    contents.forEach((content) => {
      // content.reactionCounts = reactionsObj[`${content._id}`].reactionCounts;
      // content.userReaction = reactionsObj[`${content._id}`].userReaction;
    });
    // log(contents);

    return reactionsObj;
  }

  reactionObjInit() {
    return { reactions: REACTIONSINIT, userReaction: null };
  }

  appendReaction(contentRef, reaction = null) {
    contentRef.userReaction = reaction;
  }
};

// function reactionObj(contentID, user, reaction) {
//   return { reaction: reaction, user: user, contentID: contentID };
// }
