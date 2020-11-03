// const { update } = require("../db/db-reaction");

module.exports = class Reactionable {
  constructor(contentModel, reactionModel) {
    this.Content = contentModel;
    this.Reaction = reactionModel;
  }

  _checkReaction(reaction) {
    if (!["love", "haha", "sad", "angry"].includes(reaction)) {
      throw new Error("reaction is not one of love, haha, sad, and angry");
    }
  }

  async _decrementReaction(contentID, reaction) {
    let update = { $inc: { ["reactions." + reaction]: -1 } };
    let options = { new: true };
    let a = await this.Content.findByIdAndUpdate(contentID, update, options);
    return a;
  }

  async _incrementReaction(contentID, reaction) {
    let update = { $inc: { ["reactions." + reaction]: 1 } };
    let options = { new: true };
    let incrementedReaction = await this.Content.findByIdAndUpdate(
      contentID,
      update,
      options
    );
    return incrementedReaction;
  }

  async _updateReaction(contentID, previousReaction, newReaction) {
    let prevReact = "reactions." + previousReaction;
    let newReact = "reactions." + newReaction;
    let update = { $inc: { [prevReact]: -1 }, $inc: { [newReact]: 1 } };
    let options = { new: true };

    let a = await this.Content.findByIdAndUpdate(contentID, update, options);
    return a;
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
    let newDoc;
    if (reactionDoc) {
      newDoc = await this._updateReaction(
        contentID,
        reactionDoc.reaction,
        reaction
      );
    } else {
      newDoc = await this._incrementReaction(contentID, reaction);
    }

    let reactions = await this.getReactionCounts(contentID);
    return reactions;
  }

  async deleteReactions(contentIDs) {
    let a = await this.Reaction.deleteMany({ contentID: { $in: contentIDs } });
    return a;
  }

  async appendReqReactions(user, contents) {
    let arr = contents.map((content) => {
      content.userReaction = null;
      return content._id;
    });
    arr = await this.Reaction.find({
      contentID: { $in: arr },
      "user._id": user._id,
    });
    arr.map((reactionDoc) => {
      let contentRef = contents.find((content) => {
        return content._id === reactionDoc.contentID;
      });
      // ??????????????
      this.appendReaction(contentRef, reactionDoc.reaction);
    });
    return contents;
  }
  appendReaction(contentRef, reaction = null) {
    contentRef.userReaction = reaction;
  }

  async getReactionCounts(contentID) {
    let reactions =
      //
      await this.Reaction.aggregate([
        { $match: { contentID: contentID } },
        { $project: { user: 1, reaction: 1, _id: 0 } },
        {
          $group: {
            _id: "$reaction",
            count: { $sum: 1 },
          },
        },
      ]);

    let reactionsObj = {};
    reactions.forEach((reaction) => {
      // log(reaction._id);
      reactionsObj[reaction._id] = reaction.count;
    });
    // log(reactionsObj);
    // log(reactions);
    return reactionsObj;
  }

  async getReactions(contentID, reaction, lastReaction = null) {
    let reactions =
      //
      await this.Reaction.aggregate([
        { $match: { contentID: contentID } },
        // { $project: { user: 1, reaction: 1, _id: 0 } },
        // {
        //   $group: {
        //     _id: "$reaction",
        //     count: { $sum: 1 },
        //   },
        // },
      ]);
    return reactions;
  }
  // // change to paging each emotion, 20
  // async getReactions(contentID) {
  //   let reactions =
  //     //
  //     await this.Reaction.aggregate([
  //       { $match: { contentID: contentID } },
  //       { $project: { user: 1, reaction: 1, _id: 0 } },
  //       {
  //         $group: {
  //           _id: "$reaction",
  //           count: { $sum: 1 },
  //           documents: { $push: "$$ROOT" },
  //         },
  //       },
  //     ]);

  //   return reactions;
  // }
};

function reactionObj(contentID, user, reaction) {
  return { reaction: reaction, user: user, contentID: contentID };
}
