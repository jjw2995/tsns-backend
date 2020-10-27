const { update } = require("../db/db-reaction");

const qwe = require("mongoose").model("Post");
const log = (msg) => console.log("\n", msg);
let contentModel;
let reactionModel;
module.exports = class Reactionable {
  constructor(content_Model, reaction_Model) {
    contentModel = content_Model;
    reactionModel = reaction_Model;
    // log(reactionModel);
  }

  _checkReaction(reaction) {
    // log(!["love", "haha", "sad", "angry"].includes(reaction));
    if (!["love", "haha", "sad", "angry"].includes(reaction)) {
      throw new Error("reaction is not one of love, haha, sad, and angry");
    }
  }
  // inc (add new reaction)
  async _incrementReaction(contentID, reaction) {
    // this._checkReaction(reaction);
    // let a = 'reactions.' + reaction
    // log(a)
    let update = { $inc: { ["reactions." + reaction]: 1 } };
    let options = { new: true };
    // qwe.findOneAndUpdate(c)
    let a = await contentModel.findByIdAndUpdate(contentID, update, options);
    // log(a);
    return a;
  }

  // dec (remove reaction)
  // TODO: maybe ensure no negative values?
  async _decrementReaction(contentID, reaction) {
    // this._checkReaction(reaction);

    let update = { $inc: { ["reactions." + reaction]: -1 } };
    let options = { new: true };
    let a = await contentModel.findByIdAndUpdate(contentID, update, options);
    return a;
  }

  // update dec inc (change existing reation)
  async _updateReaction(contentID, previousReaction, newReaction) {
    let prevReact = "reactions." + previousReaction;
    let newReact = "reactions." + newReaction;
    let update = { $inc: { [prevReact]: -1 }, $inc: { [newReact]: 1 } };
    let options = { new: true };

    let a = contentModel.findByIdAndUpdate(contentID, update, options);
    return a;
  }

  async postReaction(user, contentID, reaction) {
    this._checkReaction(reaction);

    let reactionDoc = await reactionModel.findOneAndUpdate(
      {
        contentID: contentID,
        "user._id": user._id,
      },
      reactionObj(contentID, user, reaction),
      { upsert: true, new: true }
    );
    log(reactionDoc);
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
    return newDoc;
  }

  // async deleteReactions(user, contentID) {
  //   let reactionDoc = await reactionModel.findOneAndDelete({
  //     contentID: contentID,
  //     "user._id": user._id,
  //   });
  //   if (!reactionDoc) throw 0;
  //   await this._decrementReaction(contentID, reactionDoc.reaction);
  //   return reactionDoc;
  // }

  async deleteReactions(contentIDs) {
    // log(contentIDs);
    let a = await reactionModel.deleteMany({ contentID: { $in: contentIDs } });
    log(a);
    // log(a);
    // log(a);
    return a;
  }

  async appendReqReactions(user, contents) {
    let arr = contents.map((content) => {
      content.userReaction = null;
      return content._id;
    });
    arr = await reactionModel.find({
      contentID: { $in: arr },
      "user._id": user._id,
    });
    // log("herehereherehereherehere?");
    arr.map((reactionDoc) => {
      let contentRef = contents.find((content) => {
        return content._id === reactionDoc.contentID;
      });
      this.appendReaction(contentRef, reactionDoc.reaction);
    });
    // erase this
    // console.log(contents);
    return contents;

    // let a = Promise.all(arr)
  }
  appendReaction(contentRef, reaction = null) {
    contentRef.userReaction = reaction;
  }

  //
  //   getReactionDoc(){}

  // reactions: {
  //     love: { type: Number, default: 0 },
  //     haha: { type: Number, default: 0 },
  //     sad: { type: Number, default: 0 },
  //     angry: { type: Number, default: 0 }
  // }
};

function reactionObj(contentID, user, reaction) {
  return { reaction: reaction, user: user, contentID: contentID };
}

//
//
//
//
//

// const qwe = require('mongoose').model('Post');
// const log = (msg) => console.log('\n', msg);
// let model;
// module.exports = class Reactionable {
// 	constructor(reactionableM_odel) {
// 		model = reactionableM_odel;
// 	}

// 	_checkReaction(reaction) {
// 		if (!['love', 'haha', 'sad', 'angry'].includes(reaction)) {
// 			throw new Error('reaction is not one of love, haha, sad, and angry');
// 		}
// 	}
// 	// inc (add new reaction)
// 	async _incrementReaction(contentID, reaction) {
// 		this._checkReaction(reaction);
// 		// let a = 'reactions.' + reaction
// 		// log(a)
// 		let update = { $inc: { ['reactions.' + reaction]: 1 } };
// 		let options = { new: true };
// 		let a = await model.findByIdAndUpdate(contentID, update, options);
// 		return a;
// 	}

// 	// dec (remove reaction)
// 	// TODO: maybe ensure no negative values?
// 	async _decrementReaction(contentID, reaction) {
// 		this._checkReaction(reaction);

// 		let update = { $inc: { ['reactions.' + reaction]: -1 } };
// 		let options = { new: true };
// 		let a = await model.findByIdAndUpdate(contentID, update, options);
// 		return a;
// 	}

// 	// update dec inc (change existing reation)
// 	async _updateReaction(contentID, previousReaction, newReaction) {
// 		this._checkReaction(previousReaction);
// 		this._checkReaction(newReaction);
// 		let prevReact = 'reactions.' + previousReaction;
// 		let newReact = 'reactions.' + newReaction;
// 		let update = { $inc: { [prevReact]: -1 }, $inc: { [newReact]: 1 } };
// 		let options = { new: true };

// 		let a = model.findByIdAndUpdate(contentID, update, options);
// 		return a;
// 	}

// 	// _checkNegativeKeepSync

// 	// reactions: {
// 	//     love: { type: Number, default: 0 },
// 	//     haha: { type: Number, default: 0 },
// 	//     sad: { type: Number, default: 0 },
// 	//     angry: { type: Number, default: 0 }
// 	// }
// };
