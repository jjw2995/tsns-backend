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
    // await dbReset()
})

let id = '5f2fe93b2ff6db7576fbbce0'

let u1 = { nickname: 'u1', _id: 'id1' }
let u2 = { nickname: 'u2', _id: 'id2' }

let emotions = ['love', 'haha', 'sad', 'angry']
let ctype = ['comment', 'post']

describe.skip('service-reaction', () => {
    describe('.addReaction', () => {
        it('normal add', async () => {
            let a = await Service.addReaction(u1, emotions[2], id, ctype[1])
        })
        it('inserting on same user and different content', async () => {
            await Service.addReaction(u1, emotions[3], id, ctype[1])
            await Service.addReaction(u1, emotions[3], id, ctype[0])
            // await getAll()
        })
        it('inserting twice on same user and content, reject', (done) => {
            Service.addReaction(u1, emotions[3], id, ctype[1]).then(() => {
                return Service.addReaction(u1, emotions[3], id, ctype[1])
            }).catch((e) => {
                expect(e).to.be.an("error")
                done()
            })
            // await getAll()
        })

    })

    describe('.updateReacion', () => {
        it('normal update', async () => {
            let a = await Service.addReaction(u1, emotions[3], id, ctype[1])
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
                arr.push(Service.addReaction(u, emotion, '1', ctype[1]))
            }
            return await Promise.all(arr)
        }

        it('a', async () => {
            gen(0, 10, emotions[0])
            gen(10, 20, emotions[1])
            gen(20, 30, emotions[2])
        })
        it('b', async () => {
            await Service.addReaction(u, emotions[2], 'NOTTHEONE', ctype[1])
            await Service.getReactionCounts('p1')
            // getAll()
        })
    })

})