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
	})
}

describe('friendService', () => {
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

	describe.only('.getPending', () => {
		setup()
		async function setFriends () {
			// u1 
			// u2 friend, u3 u4 pending , u4 
			await beFriendReqRec(u1, u2)
			await beFriendReqRec(u2, u1) // friends
			await beFriendReqRec(u3, u1) // pending
			await beFriendReqRec(u4, u1) // pending
			await friendService.query()
			log('setViewed enter')
			await friendService.setViewed(u1, u4, true)
			// await beFriendReqRec(u5, u1)
		}

		it('no option (default notViewed) => u1 should see u3, u4', async () => {
			await setFriends()
			// let list = await friendService.getPending(u1)
			// expect(list).to.include.members([u3, u4])
		})
	})
})