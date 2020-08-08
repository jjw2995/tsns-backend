// const chai = require('chai')
// const mongoose = require('mongoose')
// const { should, expect } = require('chai')

// const Post = mongoose.model('Post')
// const { PostService } = require('../services')

// let Service = new PostService(Post)


// let log = (m) => console.log('\n', m, '\n')

// let u1 = { nickname: 'u1', _id: 'id1' }
// let u2 = { nickname: 'u2', _id: 'id2' }
// let u3 = { nickname: 'u3', _id: 'id3' }
// let u4 = { nickname: 'u4', _id: 'id4' }
// let u5 = { nickname: 'u5', _id: 'id5' }
// let u6 = { nickname: 'u6', _id: 'id6' }

// let p1 = { description: 'd1', media: [] }
// let p2 = { description: 'd2', media: ['url1', 'url2'] }
// let p3 = { description: 'd3', media: ['url3'] }
// let p4 = { description: 'd4', media: ['url4', 'url5', 'url6'] }

// let pNot = { description: 'd4', media: ['url4', 'url5', 'url6'], something: 2 }



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
//     await Post.deleteMany({})
// }




// describe.only('postService', () => {
//     describe('.addPost', () => {
//         it('normal add', async () => {
//             let a = await Service.addPost(u1, p1)
//             log(a)
//         })
//         it('abnormal add', async () => {
//             let a = await Service.addPost(u1, pNot)
//             log(a)
//         })
//     })

//     // describe('.removePostByID', () => {

//     // });
//     // describe('.findPostsGivenUserIDs', () => {

//     // });
//     // describe('', () => {

//     // });
// })
