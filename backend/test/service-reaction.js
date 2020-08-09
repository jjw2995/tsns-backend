// const chai = require('chai')
// const mongoose = require('mongoose')
// const { expect } = require('chai')

// const Comment = mongoose.model('Comment')
// const { CommentService } = require('../services')

// let Model = Comment
// let Service = new CommentService(Comment)


// let log = (m) => console.log('\n', m, '\n')

// before('asd', async () => {
//     let dbp = 'mongodb://localhost:27017'
//     await mongoose.connect(dbp, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true,
//         useFindAndModify: false,
//     })
//     // await Friend.collection.dropIndexes()
//     await dbReset()
// })

// // after(async () => {
// //     await dbReset()
// //     await mongoose.disconnect()
// // })

// async function dbReset () {
//     await Model.deleteMany({})
// }

// beforeEach(async () => {
//     await dbReset()
// })

// function arrify (object) {
//     let arr = []
//     for (const key in object) {
//         if (object.hasOwnProperty(key)) {
//             // const element = object[key]

//             arr.push({ [key]: object[key] })
//         }
//     }
//     return arr
// }

// describe('service-reaction', () => {
//     describe('.addComment', () => {
//         it('', () => {

//         })
//     })
// })