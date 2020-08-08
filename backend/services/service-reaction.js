const TEST = require('mongoose').model('Post')

let log = (m) => console.log('\n', m, '\n')
let Friend

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

module.exports = class PostService {
    constructor (postModel) {
        Post = postModel
    }


    // user: {
    //     _id: { type: String, index: true, required: true },
    //     nickname: { type: String, required: true }
    // },
    // description: { type: String, maxlength: 150, trim: true }, // resource address
    // mediaURLs: [{ type: String, trim: true }],
    // viewLevel: { type: String, enum: ['private', 'friends', 'public'] }

    async deleteFriend (requester, receiver) {
        let _id = getDocId(requester, receiver)
        let deleted = await Friend.findOneAndDelete({ _id: _id, isFriends: true })
        if (!deleted) {
            throw new Error(`friend document between ${requester._id} and ${receiver._id} never existed OR wrong id`)
        }
        // log(deleted)
        return `friend document ${_id} has been deleted`
    }

    _getDocId (u0, u1) {
        return getDocId(u0, u1)
    }

}


