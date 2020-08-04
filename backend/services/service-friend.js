// const Friend = require('mongoose').model('Friend')
// const bcrypt = require('bcryptjs');

let log = (m) => console.log('\n', m, '\n')
let Friend
function newFriendObj (requester, receiver) {
	return new Friend({
		users: [
			{
				nickname: requester.nickname,
				isPending: false,
				hasViewed: true,
				_id: requester._id,
			},
			{ nickname: receiver.nickname, _id: receiver._id },
		],
	})
}
module.exports = class FriendService {
	constructor (friend) {
		Friend = friend
	}

	// https://docs.mongodb.com/manual/reference/operator/aggregation/cond/
	// optimize db operation later
	async beFriend (requester, receiver) {
		if (requester._id == receiver._id) {
			// log('req id = rec id')
			throw new Error(`Cannot add oneself in a friend request`)
		}
		let dbResults = await Friend.find({ users: { $all: [{ $elemMatch: { _id: requester._id } }, { $elemMatch: { _id: receiver._id } }] }, })
		if (dbResults.length > 0) {
			let requesterDoc = dbResults[0].users.filter(user => user._id == requester._id)[0]
			if (requesterDoc.isPending == false) {
				throw new Error(`${requester._id} has already requested friend request`)
			} else {
				let document = dbResults[0]
				let uIndex = dbResults[0].users.findIndex((user) => user._id == requester._id)
				document.users[uIndex].isPending = false
				document.users[uIndex].hasViewed = true
				document.isFriends = true
				document.friendSince = Date.now()
				let a = await document.save()
				// log(a)
				return { friends: [requester, receiver] }
			}
		} else {
			let friendVirDoc = newFriendObj(requester, receiver)
			await friendVirDoc.save()
			return { requestComplete: { requester: requester, receiver: receiver } }

		}
	}

	async getPending (user, getViewed = false) {
		let rv = await Friend.find(
			{
				users: { $elemMatch: { _id: user._id } }
			})
		log(rv)
		return rv
	}

	async query () {
		console.log('IN QUERY')
		let b = await Friend.find({
			users: {
				$all: [{ $elemMatch: { _id: 'id1' } }, { $elemMatch: { _id: 'id2' } }],
			},
		}).lean()
		log(b[0])
		return new Promise((resolve, reject) => {
			resolve()
		})
	}
	// async resetDB () {
	// 	return await Friend.deleteMany({})
	// }
	resetDB () {
		return new Promise((resolve, reject) => {
			Friend.deleteMany({}).then(resolve()).catch(reject())
		})
	}

}
