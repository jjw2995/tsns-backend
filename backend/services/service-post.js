const mongoose = require('mongoose')

let log = (m) => console.log('\n', m, '\n')
let Post

module.exports = class PostService {
    constructor (postModel) {
        Post = postModel
    }

    // post = { description: 'd', media: [] }

    async addPost (user, post) {
        // try {
        let _id = 'p' + mongoose.Types.ObjectId()
        let a = await Post.create({ _id, user, post })
        return a
        // } catch (error) {
        //     return new Error(error)
        // }
    }

    async removePost (post) {
        let a = await Post.findByIdAndDelete(post._id)
        return {}

    }

    async getPosts (user, friends) {
        // try {
        let ids = friends.map(x => { return x._id })

        // test.find().sort
        let a = await Post.find({
            $or: [{
                $and: [
                    { 'user._id': { $in: friends } },
                    { 'post.level': { $ne: 'private' } }]
            }, { 'user._id': user._id }],
        }).sort({ createdAt: -1 })
        // log(a)
        return a
        // } catch (error) {
        //      log(error)
        // }
    }

    async getPublicPosts (n = 5) {
        // try {
        let lastHour = new Date()
        lastHour.setHours(lastHour.getHours() - 1)

        // db.tweetdatas.aggregate(
        //     {$match:{ "createdAt":{$gt: lastHour}, }},
        //     {$project: { "createdAt":1, "createdAt_Minutes": { $minute : "$createdAt" }, "tweets":1, }},
        //     {$group:{ "_id":"$createdAt_Minutes", "sum_tweets":{$sum:"$tweets"} }}
        //   ) 

        let a = await Post.find({ 'post.level': 'public', createdAt: { $gt: lastHour } }).sort({ createdAt: 1 }).limit(n)
        return a
    }

    // user: {
    //     _id: { type: String, index: true, required: true },
    //     nickname: { type: String, required: true }
    // },
    // post: {
    //     description: { type: String, maxlength: 150, trim: true, default: '' },
    //     media: [{ type: String, trim: true }], // resource address
    //     level: { type: String, enum: ['private', 'friends', 'public'], default: 'friends' },
    //     likes: { type: Number, default: 0 }
    // }


    async explorePosts () {
        // get public posts (new & highly liked?)

    }


}


