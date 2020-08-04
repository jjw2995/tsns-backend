// require('../db')
const chai = require('chai')
const mongoose = require('mongoose')
const Friend = mongoose.model('Friend')
const { FriendService } = require('../services')
const { should, expect } = require('chai')


let friendService = new FriendService(Friend)

chai.use(require('chai-http'))
// let should = should
let log = (m) => console.log('\n', m, '\n')

let u1 = { nickname: 'u1', _id: 'id1' }
let u2 = { nickname: 'u2', _id: 'id2' }
let u3 = { nickname: 'u3', _id: 'id3' }
let u4 = { nickname: 'u4', _id: 'id4' }
let u5 = { nickname: 'u5', _id: 'id5' }

function setup () {
	before('asd', (done) => {
		let dbp = 'mongodb://localhost:27017'
		mongoose.connect(
			dbp,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false,
			},
			(e) => {
				friendService.resetDB().finally(done())
				// if (e) done(e)
				// done()
			}
		)

	})
	after(async () => {
		await mongoose.disconnect()
		log('== DONE ==')
	})
}

describe.only('friendService', () => {
	async function beFriendReqRec (req, rec) {
		let result = await friendService.beFriend(req, rec)
		// console.log(result)
		return new Promise((resolve, reject) => {
			resolve(result)
		})
	}

	describe('.beFriend', () => {
		setup()
		afterEach((done) => {
			friendService.resetDB().finally(done())
			// log('AfterEach')
		})

		it('u1 add u2		=> u1 requested, u2 pending', (done) => {
			beFriendReqRec(u1, u2).then((rv) => {
				expect(rv).to.eql({ requestComplete: { requester: u1, receiver: u2 } })
				done()
			})
		})

		it('u1 add u1		=> should not add self as friend, reject', (done) => {
			beFriendReqRec(u1, u1).catch((rv) => {
				expect(rv.message).to.have.string(`Cannot add oneself in a friend request`)
				done()
			})
		})

		it('u1 add u2, u2 add u1	=> u1 u2 requested, isFriends true', (done) => {
			beFriendReqRec(u1, u2).then((rv1) => {
				beFriendReqRec(u2, u1).then((rv2) => {
					expect(rv2.friends).to.include.members([u1, u2])
					done()
				})
			})
		})


		it('u1 add u2, u1 add u2 	=> should be rejected isFriends false', (done) => {
			beFriendReqRec(u1, u2).then((rv1) => {
				// log(rv1)
				beFriendReqRec(u1, u2).catch((rv2) => {
					// log(rv2)
					expect(rv2.message).to.have.string(`${u1._id} has already requested friend request`)
					done()
				})
			})
		})

	})
	// get all pending not viewed
	// set pending viewed (dismiss notification)
	// get all pending 

	// get all friends

	describe.skip('.getNotViewedPending', () => {
		setup()
		before(async () => {
			await beFriendReqRec(u1, u2)
			await beFriendReqRec(u2, u1)
			await beFriendReqRec(u3, u1)
			await beFriendReqRec(u4, u1)
		})

		it('', () => {

		})
	})


})




// // require('../db')
// const chai = require('chai')
// const mongoose = require('mongoose')
// const Friend = mongoose.model('Friend')
// const { FriendService } = require('../services')
// const { should } = require('chai')


// let friendService = new FriendService(Friend)

// chai.use(require('chai-http'))
// let log = (m) => console.log('\n', m, '\n')

// let u1 = { nickname: 'u1', _id: 'id1' }
// let u2 = { nickname: 'u2', _id: 'id2' }
// let u3 = { nickname: 'u3', _id: 'id3' }
// let u4 = { nickname: 'u4', _id: 'id4' }
// let u5 = { nickname: 'u5', _id: 'id5' }

// // user befriends otherUser
// // => normal add

// // user befriends oU where oU befriended user
// // => user.status=settled, isFriends:true

// // getPendingList
// //
// // let should = chai.should
// describe.only('service-relations', () => {

// 	before('asd', (done) => {
// 		let dbp = 'mongodb://localhost:27017'
// 		mongoose.connect(
// 			dbp,
// 			{
// 				useNewUrlParser: true,
// 				useUnifiedTopology: true,
// 				useCreateIndex: true,
// 				useFindAndModify: false,
// 			},
// 			(e) => {
// 				friendService.resetDB().finally(done())
// 				// if (e) done(e)
// 				// done()
// 			}
// 		)

// 	})
// 	after(async () => {
// 		await mongoose.disconnect()
// 		log('== DONE ==')
// 	})

// 	afterEach((done) => {
// 		friendService.resetDB().finally(done())
// 		// log('AfterEach')
// 	})
// 	async function beFriendReqRec (req, rec) {
// 		let result = await friendService.beFriend(req, rec)
// 		console.log(result)
// 		return new Promise((resolve, reject) => {
// 			resolve(result)
// 		})
// 	}

// 	it('u1 adds u2 - u1 requested, u2 pending', (done) => {
// 		beFriendReqRec(u1, u2).then((result) => {
// 			assert.deepEqual(result, {
// 				requestComplete:
// 				{
// 					requester: u1,
// 					receiver: u2
// 				}
// 			}, "[message]")
// 			// result.should.eql()
// 			done()
// 		})
// 	})

// 	it('u1 add u2, u2 add u1 - u1 u2 settled, isFriends true', (done) => {
// 		beFriendReqRec(u1, u2).then(() => {
// 			beFriendReqRec(u2, u1).then((rv) => {
// 				chai.assert.deepEqual(rv, { friends: { u1, u2 } }, "[message]")
// 				done()
// 			})
// 		})
// 	})
// })
