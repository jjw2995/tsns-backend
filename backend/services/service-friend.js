const Friend = require('mongoose').model('Friend')
// const bcrypt = require('bcryptjs');

const { db } = require("../db/db-user")
const e = require("express")

let log = (m) => console.log('\n', m, '\n')
// let Friend
function newFriendObj (requester, receiver) {
	return new Friend({
		ids: [requester._id, receiver._id],
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
		// Friend = friend
	}

	// https://docs.mongodb.com/manual/reference/operator/aggregation/cond/
	// optimize db operation later
	async beFriend (requester, receiver) {
		if (requester._id == receiver._id) {
			// log('req id = rec id')
			throw new Error(`Cannot add oneself in a friend request`)
		}
		let dbResults = await
			Friend.find({ users: { $all: [{ $elemMatch: { _id: requester._id } }, { $elemMatch: { _id: receiver._id } }] }, })

		if (dbResults && dbResults.length > 0) {
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

	async getPending (user, option = 'notViewed') {
		// all, viewed, notViewed
		let hv
		// switch (option) {
		// 	case 'all':
		// 		// hv = 
		// 		break
		// 	case 'viewed':

		// 		break
		// 	case 'notViewed':

		// 		break

		// 	default:
		// 		throw new Error(`Option not available`)
		// }

		let rv = await Friend.find(
			{ users: { $elemMatch: { _id: user._id, isPending: true, /* asViewed: true */ } } }, 'users._id users.nickname')

		let arr = []
		for (let elem of rv) {
			for (let el of elem.users) {
				if (el._id != user._id)
					arr.push(el)
			}
		}
		// log(arr)

		return arr
	}

	async setViewed (requester, receiver, viewed) {
		// return { requestComplete: { requester: requester, receiver: receiver } }
		let query = {
			ids:
				{ $all: [requester._id, receiver._id] }
		}
		// let update = { '$set': { 'users.$.hasViewed': viewed } }
		// let option = { new: true }
		let friendDocs = await Friend.find(query)

		if (friendDocs.length == 0) {
			throw new Error(`cannot find any friend document between ${requester._id} and ${receiver._id}`)
		}

		log(friendDocs)
		let friendVirDoc = newFriendObj(requester, receiver)
		friendVirDoc.save().then((d) => log(d)).catch(e => log(e))



	}

	async query () {
		let b = await Friend.find({})
		// Friend.find({
		// 	users: {
		// 		$all: [{ $elemMatch: { _id: 'id1' } }, { $elemMatch: { _id: 'id2' } }],
		// 	},
		// }).lean()
		// log(b)

		log('============== IN QUERY ==============')
		for (let elem of b) {
			// log(b)
			log(elem)
		}
		log('============== QUERY DONE ==============')
		return new Promise((resolve, reject) => {
			resolve()
		})
	}

	resetDB () {
		return new Promise((resolve, reject) => {
			Friend.deleteMany({}).then(resolve()).catch(reject())
		})
	}

}
