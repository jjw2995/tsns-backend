const chai = require('chai')
const mongoose = require('mongoose')
const { expect } = require('chai')

const Comment = mongoose.model('Comment')
const { CommentService } = require('../services')

let Model = Comment
let Service = new CommentService(Comment)


let log = (m) => console.log('\n', m, '\n')

before('asd', async () => {
    let dbp = 'mongodb://localhost:27017'
    await mongoose.connect(dbp, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    // await Comment.collection.dropIndexes()
    await dbReset()
})

// after(async () => {
//     await dbReset()
//     await mongoose.disconnect()
// })

async function dbReset () {
    await Model.deleteMany({})
}

beforeEach(async () => {
    await dbReset()
})

async function getAll () {
    let a = await Model.find({})
    log(a)
}

function arrify (object) {
    let arr = []
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            // const element = object[key]

            arr.push({ [key]: object[key] })
        }
    }
    return arr
}

let u1 = { _id: 'id1', nickname: 'u1' }
let u2 = { nickname: 'u2', _id: 'id2' }

let p1 = { _id: 'p1' }
let p2 = { _id: 'p2' }

let c1 = 'c 1'
let c2 = 'c 2'
let c3 = 'c 3'
// let u = { nickname: 'u', _id: 'id' }
// let u = { nickname: 'u', _id: 'id' }
// let u = { nickname: 'u', _id: 'id' }
let com1
let com2
let com3

// function gen (n) {
//     let arr = []
//     for (let i = 0; i < n; i++) {
//         arr.push({u:{_id:'_id'+i,nickname: 'nick'+i}})
//     }
// }

describe('service-reaction', () => {
    describe('.addComment', () => {
        it('ok comment', async () => {
            com1 = await Service.addComment(u1, p1, c1)
            // log(com1)
        })
        it('ok subcomment', async () => {
            com1 = await Service.addComment(u1, p1, c1)
            log(com1._id)
            com2 = await Service.addComment(u2, p1, c2, com1)
        })
        it('invalid subcomment', async () => {
            com1 = await Service.addComment(u1, p1, c1)
            Service.addComment(u2, p2, c2, com1).catch(e => {
                expect(e.message).to.equal('cannot leave subcomment on different post\'s subcomment')
            })
        })
        it('ok subcomment', async () => {
            com1 = await Service.addComment(u1, p1, c1)
            com2 = await Service.addComment(u2, p1, c2, com1)
            com3 = await Service.addComment(u2, p1, c2, com2)
        })

        it('parent comment removed, throw error', async () => {
            // getAll()
            await Service.addComment(u2, p1, 'subC1', { _id: '7f2fb2b46115da67baeb84d4', postID: p1._id })
            // getAll()
        })
    })

    describe('.getPostComments - get standalone comments /* + few subcomments */', () => {
        it('NOT A TEST, simple block to see if code is functional', async () => {
            await Service.addComment(u1, p1, c1)
            com1 = await Service.addComment(u1, p1, c1)
            com2 = await Service.addComment(u2, p1, c2, com1)
            com3 = await Service.addComment(u2, p1, c2, com2)
            let a = await Service.getPostComments(p1)
        })
    })

    describe('.getPostComment', () => {
        it('NOT A TEST, simple block to see if code is functional', async () => {
            await Service.addComment(u1, p1, 'c1')
            await Service.addComment(u1, p1, 'c2')
            await Service.addComment(u1, p1, 'c3')
            await Service.addComment(u1, p1, 'c4')
            com1 = await Service.addComment(u1, p1, 'c7')
            com2 = await Service.addComment(u2, p1, 'c3', com1)
            com3 = await Service.addComment(u2, p1, 'c4', com2)
            let a = await Service.getPostComments(p1)
            log(a)
        })
    })

    describe('.getSubComment', () => {
        it('NOT A TEST, simple block to see if code is functional', async () => {
            com1 = await Service.addComment(u1, p1, 'c1')
            await Service.addComment(u2, p1, 'subC1', com1)
            await Service.addComment(u2, p1, 'subC2', com1)
            await Service.addComment(u2, p1, 'subC3', com1)
            await Service.addComment(u2, p1, 'subC4', com1)
            await Service.addComment(u2, p1, 'subC5', com1)
            await Service.addComment(u2, p1, 'subC6', com1)
            let b = await Service.addComment(u2, p1, 'subC7', com1)
            await Service.addComment(u2, p1, 'subC8', com1)
            await Service.addComment(u2, p1, 'subC9', com1)
            let a = await Service.getSubComments(com1, b, 2)
            log(a)
        })
    })


    describe('.removeComment', () => {
        it('NOT A TEST, simple block to see if code is functional', async () => {
            com1 = await Service.addComment(u1, p1, 'c1')
            // await Service.addComment(u2, p1, 'subC2', com1)
            let b = await Service.addComment(u2, p1, 'subC7', com1)

            await Service.addComment(u2, p1, 'subC8', com1)
            await Service.addComment(u2, p1, 'subC9', com1)
            let a = await Service.removeComment(com1)
            // log(b)
            getAll()
            // log(a)
        })
    })


})
