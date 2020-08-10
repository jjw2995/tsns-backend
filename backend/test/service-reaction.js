const chai = require('chai')
const mongoose = require('mongoose')
const { expect } = require('chai')

const Reaction = mongoose.model('Reaction')
const { ReactionService } = require('../services')

let Model = Reaction
let Service = new ReactionService(Reaction)

let log = (m) => console.log('\n', m, '\n')

before('asd', async () => {
    let dbp = 'mongodb://localhost:27017'
    await mongoose.connect(dbp, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    // await Reaction.collection.dropIndexes()
    // let a = await Reaction.collection.getIndexes({ full: true })
    // log(a)
    await dbReset()
})

async function dbReset () {
    await Reaction.deleteMany({})
}

async function getAll () {
    let a = await Model.find({})
    log(a)
}
after(async () => {
    dbReset()
})
beforeEach(async () => {
    dbReset()
})

let postID = 'p5f2fe93b2ff6db7576fbbce0'
let commentID = 'c5f2fe93b2ff6db7576fbbce0'

let u1 = { nickname: 'u1', _id: 'id1' }
let u2 = { nickname: 'u2', _id: 'id2' }

let emotions = ['love', 'haha', 'sad', 'angry']
let ctype = ['comment', 'post']


describe('service-reaction', () => {
    describe('.addReaction', () => {
        it('normal add', async () => {
            let a = await Service.addReaction(u1, emotions[2], postID)
        })
        it('inserting on same user and different content', async () => {
            await Service.addReaction(u1, emotions[3], postID)
            await Service.addReaction(u1, emotions[3], commentID)
            // await getAll()
        })
        it('insert twice by same user and content, reject', (done) => {
            Service.addReaction(u1, emotions[3], postID).then(() => {
                return Service.addReaction(u1, emotions[3], postID)
            }).catch((e) => {
                expect(e).to.be.an("error")
                done()
            })
            // await getAll()
        })

    })

    describe('.updateReacion', () => {
        it('normal update', async () => {
            let a = await Service.addReaction(u1, emotions[3], postID)
            let b = await Service.updateReaction(a._id, emotions[1])
            log(b)
        })
    })

    describe('.getReaction', () => {

        async function gen (i, n, emotion) {
            let arr = []
            for (; i < n; i++) {
                u = { _id: i, nickname: 'u' + i }
                // log(u)
                arr.push(Service.addReaction(u, emotion, postID))
            }
            return await Promise.all(arr)
        }

        // it('a', async () => {
        // })
        it('b', async () => {
            gen(0, 10, emotions[0])
            gen(10, 20, emotions[1])
            gen(20, 30, emotions[2])
            await Service.addReaction(u1, emotions[2], commentID)
            await Service.getReactionCounts(postID)
            // getAll()
        })
    })

})