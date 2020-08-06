const riend = require('mongoose').model('Friend')

const { use } = require("chai")

// const bcrypt = require('bcryptjs');
let log = (m) => console.log('\n', m, '\n')
let Friend
function newFriendObj (requester, receiver) {
	let req = {
		nickname: requester.nickname,
		isPending: false,
		hasViewed: true,
		_id: requester._id,
	}
	let rec = { nickname: receiver.nickname, _id: receiver._id }
	let usersArr = [req, rec]

	if (getUsersIdx(requester, receiver)) {
		usersArr = [rec, req]
	}

	return new Friend({
		_id: getDocId(requester, receiver),
		users: usersArr,
	})
}


// u0-u1
// u0 < u1
function getDocId (u0, u1) {
	return u0._id < u1._id ? (u0._id + '-' + u1._id) : (u1._id + '-' + u0._id)
}
function getUsersIdx (target, other) {
	return target._id < other._id ? 0 : 1
}

module.exports = class FriendService {
	constructor (friend) {
		Friend = friend
	}



	// isFriends: t / f
	// users:
	// {
	// 	isPending
	// 	hasViewed
	// }

	// {
	// 	'$set':
	// 	{
	// 		isFriends: {
	// 			$switch: {
	// 				branches:
	// 					[{ case: { $eq: [('users.' + getUsersIdx(receiver, requester) + '.isPending'), false] }, then: true }]
	// 			}
	// 		}
	// 	}
	// },

	// {
	// db.students3.update(
	// 	{},
	// 	[
	// 		{ $set: { average: { $trunc: [{ $avg: "$tests" }, 0] }, lastUpdate: "$$NOW" } },
	// 		{
	// 			$set: {
	// 				grade: {
	// 					$switch: {
	// 						branches: [
	// 							{ case: { $gte: ["$average", 90] }, then: "A" },
	// 							{ case: { $gte: ["$average", 80] }, then: "B" },
	// 							{ case: { $gte: ["$average", 70] }, then: "C" },
	// 							{ case: { $gte: ["$average", 60] }, then: "D" }
	// 						],
	// 						default: "F"
	// }


	// // https://docs.mongodb.com/manual/reference/operator/aggregation/cond/
	// // optimize db operation later
	// async addFriend (requester, receiver) {
	// 	if (requester._id == receiver._id) {
	// 		// log('req id = rec id')
	// 		throw new Error(`Cannot add oneself in a friend request`)
	// 	}

	// 	let recVal = 'users.' + toString(getUsersIdx(receiver, requester)) + '.isPending'
	// 	let query = { _id: getDocId(requester, receiver), "users._id": requester._id }
	// 	let update =
	// 		// [
	// 		{ $set: { isFriends: { $cond: [{ recVal: { $eq: false } }, true, false] } } }
	// 	// { $set: { 'users.$.hasViewed': true } },
	// 	// { $set: { 'users.$.isPending': false } },
	// 	// {
	// 	// 	'$set':
	// 	// 	{
	// 	// 		isFriends:
	// 	// 			{ '$cond': [{ $eq: [('users.' + getUsersIdx(receiver, requester) + '.isPending'), false] }, true, false] }
	// 	// 	}
	// 	// },
	// 	// { '$set': { friendSince: { '$cond': [{ $eq: [('isFriends'), true] }, Date.now(), null] } } }
	// 	// ]
	// 	let options = { new: true }

	// 	// let f = await riend.findByIdAndUpdate(getDocId(requester, receiver), [])

	// 	let friendDoc = await Friend.findOneAndUpdate(query, update, options)

	// 	// let friendDoc = await Friend.findOneAndUpdate(query, update, options)
	// 	log(friendDoc)
	// 	if (!friendDoc) {
	// 		let friendVirDoc = newFriendObj(requester, receiver)
	// 		await friendVirDoc.save()
	// 		return { requestComplete: { requester: requester, receiver: receiver } }
	// 		// throw new Error(`setViewed from ${requester._id} -> ${receiver._id}: either such users not exist OR friend request has not yet been made`)
	// 	}

	// 	return `${requester._id} has set hasViewed:${viewed} on friend request with ${receiver._id}`
	// }


	async addFriend (requester, receiver) {
		if (requester._id == receiver._id) {
			// log('req id = rec id')
			throw new Error(`Cannot add oneself in a friend request`)
		}
		let dbResults = await
			Friend
				.find({ users: { $all: [{ $elemMatch: { _id: requester._id } }, { $elemMatch: { _id: receiver._id } }] }, })

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

	async setRequestViewed (requester, receiver, viewed) {
		// return { requestComplete: { requester: requester, receiver: receiver } }
		let query = { _id: getDocId(requester, receiver), "users._id": requester._id }
		let update = { '$set': { 'users.$.hasViewed': viewed } }
		let options = { new: true }

		let friendDoc = await Friend.findOneAndUpdate(query, update, options)
		if (!friendDoc) {
			throw new Error(`setRequestViewed from ${requester._id} -> ${receiver._id}: either such users not exist OR friend request has not yet been made`)
			// throw new Error(
		}

		return `${requester._id} has set hasViewed:${viewed} on friend request with ${receiver._id}`

	}

	async setFollowing (requester, receiver, follwing) {
		// let rv = await Friend.find({ isFriends: true, users: { $elemMatch: elMatch } }, 'users._id users.nickname', { lean: true })
		// return { requestComplete: { requester: requester, receiver: receiver } }
		let query = { _id: getDocId(requester, receiver), isFriends: true, "users._id": requester._id }
		let update = { '$set': { 'users.$.isFollowing': follwing } }
		let options = { new: true }

		let friendDoc = await Friend.findOneAndUpdate(query, update, options)
		// log(friendDoc)
		if (!friendDoc) {
			throw new Error(`setFollowing from ${requester._id} -> ${receiver._id}: either such users not exist OR are not friends yet`)
			// throw new Error(
		}

		return `${requester._id} has set hasViewed:${follwing} on friend request with ${receiver._id}`

	}

	async getFriends (user, option = 'all') {
		// all, following, notFollowing
		let elMatch = {}
		switch (option) {
			case 'all':
				elMatch = { _id: user._id }
				break
			case 'following':
				elMatch = { _id: user._id, isFollowing: true }
				break
			case 'notFollowing':
				elMatch = { _id: user._id, isFollowing: false }
				break
			default:
				throw new Error(`such option:${option} does not exist`)
		}
		let rv = await Friend.find({ isFriends: true, users: { $elemMatch: elMatch } }, 'users._id users.nickname', { lean: true })

		let arr = []
		if (rv && rv.length > 0) {
			for (let elem of rv) {
				for (let el of elem.users) {
					if (el._id != user._id)
						arr.push(el)
				}
			}
		}
		return arr
	}


	async getPending (user, viewed = false) {
		let rv = await Friend.find({ users: { $elemMatch: { _id: user._id, isPending: true, hasViewed: viewed } } }, 'users._id users.nickname', { lean: true })

		let arr = []
		for (let elem of rv) {
			for (let el of elem.users) {
				if (el._id != user._id)
					arr.push(el)
			}
		}
		// log('IN getPending')
		// log(arr)
		return arr

	}


	async _getAll () {
		let b = await Friend.find({})
		// Friend.find({
		// 	users: {
		// 		$all: [{ $elemMatch: { _id: 'id1' } }, { $elemMatch: { _id: 'id2' } }],
		// 	},
		// }).lean()
		// log(b)

		log('============== IN getAll ==============')
		for (let elem of b) {
			// log(b)
			log(elem)
		}
		log('============== getAll DONE ==============')
		return new Promise((resolve, reject) => {
			resolve()
		})
	}

}


