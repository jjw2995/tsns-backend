const qwe = require('mongoose').model('Reaction')

let log = (m) => console.log('\n', m, '\n')
let Reaction

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }
function name (params) {

}

module.exports = class ReactionService {
    constructor (reactionModel) {
        Reaction = reactionModel
    }

    // add reaction
    // contentType: enum[ 'post', 'comment' ]
    async addReaction (user, emotion, contentID, contentType) {
        // !contentType || 
        if (!(contentType == 'comment' || 'post')) {
            throw new Error('contentType needs to be declared')
        }
        let t = 'p'
        if (contentType == 'comment') {
            t = 'c'
        }
        let cID = t + contentID
        let r = { emotion: emotion, user: user, contentID: cID }
        let a = await Reaction.create(r)
        return a
    }



    // async updateReaction (reaction, emotion) {
    //     let q = { 'user._id': reaction.user._id, contentID: reaction.contentID }
    //     let u = { emotion: emotion }
    //     let ans = Reaction.findOneAndUpdate(q, u, { new: true }).lean()
    //     return ans
    // }
    async updateReaction (reactionID, emotion) {
        let u = { emotion: emotion }
        let ans = Reaction
            .findByIdAndUpdate(reactionID, u, { new: true })
            .lean()
        return ans
    }

    // {$group : { _id : '$user', count : {$sum : 1}}}
    // get all reaction based on content (post || comment)
    async getReactionCounts (contentID) {
        log(contentID)
        let a = await Reaction.aggregate([
            { $match: { contentID: contentID } },
            {
                $group: {
                    _id: "$emotion",
                    count: { $sum: 1 }
                }
            },
        ])
        log(a)
        return a
    }

    // remove reaction



    // user: {
    //     _id: { type: String, index: true, required: true },
    //     nickname: { type: String, required: true }
    // },
    // description: { type: String, maxlength: 150, trim: true }, // resource address
    // mediaURLs: [{ type: String, trim: true }],
    // viewLevel: { type: String, enum: ['private', 'friends', 'public'] }


}


