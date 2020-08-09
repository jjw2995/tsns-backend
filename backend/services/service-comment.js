const mongoose = require('mongoose')
const t = require('mongoose').model('Comment')

let log = (m) => console.log('\n', m, '\n')
let Comment

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

const PAGE_SIZE = 3
module.exports = class PostService {
    constructor (commentModel) {
        Comment = commentModel
    }

    async addComment (user, post, content, parentCom = null) {
        // let comment = new t({ postID: post._id, user: user, content: content })
        let comment = { postID: post._id, user: user, content: content }
        if (parentCom) {
            if (parentCom.parentComID) {
                parentCom._id = parentCom.parentComID
            }
            if (parentCom.postID != post._id) {
                throw new Error('cannot leave subcomment on different post\'s subcomment')
            }
            if (!parentCom.hasChild) {
                let a = await t.findOneAndUpdate({ _id: parentCom._id }, { hasChild: true, $inc: { numChild: 1 } }, { new: true }).lean()
                if (!a) {
                    throw new Error(`comment ${parentCom._id} has been removed`)
                }
            }
            comment.parentComID = parentCom._id
        }

        let a = await Comment.create(comment)
        return a
    }

    async getPostComments (post, lastComment = null, page_size = PAGE_SIZE) {
        // get all standalone comments
        let q = { postID: post._id, parentComID: null }
        if (lastComment) {
            q.createdAt = { $lt: lastComment.createdAt }
        }
        let a = await t.find(q).sort({ createdAt: -1 }).limit(page_size)
        return a
    }


    async getSubComments (parentComment, lastComment = null, page_size = PAGE_SIZE) {
        // get subcomments of a comment
        if (parentComment.parentComID) {
            parentComment._id = parentComment.parentComID
        }
        let q = { parentComID: parentComment._id }
        if (lastComment) {
            q.createdAt = { $lt: lastComment.createdAt }
        }
        let a = await t.find(q).sort({ createdAt: -1 }).limit(page_size)
        return a

    }
    // remove get
    async removeComment (comment) {
        // remove itself and all child comments
        let a = await t.deleteMany({ $or: [{ _id: comment._id }, { parentComID: comment._id }] })
        log(a)
        return a
    }

}


