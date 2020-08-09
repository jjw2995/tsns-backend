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
    // await Friend.collection.dropIndexes()
    await dbReset()
})

async function dbReset () {
    await Model.deleteMany({})
}

beforeEach(async () => {
    await dbReset()
})
