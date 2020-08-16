const model = require('mongoose').model('Follower');

let Follower;

let filterUser = (u) => {
	return { _id: u._id, nickname: u.nickname };
};

const log = (msg) => console.log('\n', msg);
module.exports = class FollowerService {
	constructor(followerModel) {
		Follower = followerModel;
	}

	createFollower(follower, followee) {
		return new Promise((resolve, reject) => {
			if (follower._id == followee._id) {
				return reject(Error('cannot follow oneself'));
			}
			let doc = {
				follower: filterUser(follower),
				followee: filterUser(followee),
			};
			if (followee.isPrivate) {
				doc.isPending = true;
			}

			Follower.create(doc)
				.then((r) => {
					resolve(r.toJSON());
				})
				.catch((e) => reject(e));
		});
	}

	deleteFollower(follower, followee) {
		return new Promise((resolve, reject) => {
			if (follower._id === followee._id) {
				return reject(Error('cannot unfollow oneself'));
			} else {
				Follower.deleteOne({
					'follower._id': follower._id,
					'followee._id': followee._id,
				})
					.then(resolve())
					.catch((e) => reject(e));
			}
		});
	}

	getFollowers(user) {
		return new Promise((resolve, reject) => {
			Follower.aggregate([
				{ $match: { 'follower._id': user._id, isPending: false } },
				{
					$project: {
						// _id: 0,
						_id: '$followee._id',
						nickname: '$followee.nickname',
					},
				},
			])
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	getWaiting(user) {
		return new Promise((resolve, reject) => {
			Follower.aggregate([
				{ $match: { 'follower._id': user._id, isPending: true } },
				{
					$project: {
						// _id: 0,
						_id: '$followee._id',
						nickname: '$followee.nickname',
					},
				},
			])
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	getPending(user) {
		return new Promise((resolve, reject) => {
			Follower.aggregate([
				{ $match: { 'followee._id': user._id, isPending: true } },
				{
					$project: {
						_id: '$follower._id',
						nickname: '$follower.nickname',
					},
				},
			])
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	acceptPending(followee, follower) {
		// log(followee);
		// log(follower);
		return new Promise((resolve, reject) => {
			Follower.updateOne(
				{
					'follower._id': follower._id,
					'followee._id': followee._id,
					isPending: true,
				},
				{ isPending: false },
				{ new: true }
			)
				.then((r) => resolve(r))
				.catch((e) => reject(e));
		});
	}

	async _reset() {
		log(await Follower.deleteMany({}));
	}
	async _listAll() {
		log(await Follower.find({}));
	}

	//
	// getPending(){}
	//
};

// let log = (m) => console.log('\n', m, '\n');
// let Follower;

// function getDocId(u0, u1) {
// 	return u0._id < u1._id ? u0._id + '-' + u1._id : u1._id + '-' + u0._id;
// }
// function newFriendObj(requester, receiver) {
// 	let req = {
// 		nickname: requester.nickname,
// 		isPending: false,
// 		hasViewed: true,
// 		_id: requester._id,
// 	};
// 	let rec = { nickname: receiver.nickname, _id: receiver._id };
// 	let usersArr = [req, rec];

// 	if (getUsersIdx(requester, receiver)) {
// 		usersArr = [rec, req];
// 	}

// 	return new Follower({
// 		_id: getDocId(requester, receiver),
// 		users: usersArr,
// 	});
// }

// // u0-u1
// // u0 < u1

// function getUsersIdx(target, other) {
// 	return target._id < other._id ? 0 : 1;
// }

// module.exports = class FollowerService {
// 	constructor(follower) {
// 		Follower = follower;
// 	}

// 	addFollower(requester, recieve) {}

// 	async deleteFriend(requester, receiver) {
// 		let _id = getDocId(requester, receiver);
// 		let deleted = await Follower.findOneAndDelete({
// 			_id: _id,
// 			isFriends: true,
// 		});
// 		if (!deleted) {
// 			throw new Error(
// 				`follower document between ${requester._id} and ${receiver._id} never existed OR wrong id`
// 			);
// 		}
// 		// log(deleted)
// 		return `follower document ${_id} has been deleted`;
// 	}

// 	async removeFriendRequest(requester, receiver) {
// 		let _id = getDocId(requester, receiver);
// 		let q = {
// 			_id: _id,
// 			isFriends: false,
// 			users: { $elemMatch: { _id: requester._id, isPending: true } },
// 		};
// 		let deleted = await Follower.findOneAndDelete({
// 			_id: _id,
// 			isFriends: false,
// 		});
// 		// log(deleted)

// 		if (!deleted) {
// 			throw new Error(
// 				`follower document between ${requester._id} and ${receiver._id} never existed OR wrong id`
// 			);
// 		}
// 		return `follower document ${deleted._id} has been deleted`;
// 	}

// 	async addFriend(requester, receiver) {
// 		if (requester._id == receiver._id) {
// 			// log('req id = rec id')
// 			throw new Error(`Cannot add oneself in a follower request`);
// 		}
// 		let dbResults = await Follower.find({
// 			users: {
// 				$all: [
// 					{ $elemMatch: { _id: requester._id } },
// 					{ $elemMatch: { _id: receiver._id } },
// 				],
// 			},
// 		});

// 		if (dbResults && dbResults.length > 0) {
// 			let requesterDoc = dbResults[0].users.filter(
// 				(user) => user._id == requester._id
// 			)[0];
// 			if (requesterDoc.isPending == false) {
// 				throw new Error(
// 					`${requester._id} has already requested follower request`
// 				);
// 			} else {
// 				let document = dbResults[0];
// 				let uIndex = dbResults[0].users.findIndex(
// 					(user) => user._id == requester._id
// 				);
// 				document.users[uIndex].isPending = false;
// 				document.users[uIndex].hasViewed = true;
// 				document.isFriends = true;
// 				document.friendSince = Date.now();
// 				let a = await document.save();
// 				// log(a)
// 				return { friends: [requester, receiver] };
// 			}
// 		} else {
// 			let friendVirDoc = newFriendObj(requester, receiver);
// 			await friendVirDoc.save();
// 			return { requestComplete: { requester: requester, receiver: receiver } };
// 		}
// 	}

// 	async setRequestViewed(requester, receiver, viewed) {
// 		// return { requestComplete: { requester: requester, receiver: receiver } }
// 		let query = {
// 			_id: getDocId(requester, receiver),
// 			'users._id': requester._id,
// 		};
// 		let update = { $set: { 'users.$.hasViewed': viewed } };
// 		let options = { new: true };

// 		let friendDoc = await Follower.findOneAndUpdate(query, update, options);
// 		if (!friendDoc) {
// 			throw new Error(
// 				`setRequestViewed from ${requester._id} -> ${receiver._id}: either such users not exist OR follower request has not yet been made`
// 			);
// 			// throw new Error(
// 		}

// 		return `${requester._id} has set hasViewed:${viewed} on follower request with ${receiver._id}`;
// 	}

// 	async setFollowing(requester, receiver, follwing) {
// 		// let rv = await Follower.find({ isFriends: true, users: { $elemMatch: elMatch } }, 'users._id users.nickname', { lean: true })
// 		// return { requestComplete: { requester: requester, receiver: receiver } }
// 		let query = {
// 			_id: getDocId(requester, receiver),
// 			isFriends: true,
// 			'users._id': requester._id,
// 		};
// 		let update = { $set: { 'users.$.isFollowing': follwing } };
// 		let options = { new: true };

// 		let friendDoc = await Follower.findOneAndUpdate(query, update, options);
// 		// log(friendDoc)
// 		if (!friendDoc) {
// 			throw new Error(
// 				`setFollowing from ${requester._id} -> ${receiver._id}: either such users not exist OR are not friends yet`
// 			);
// 			// throw new Error(
// 		}

// 		return `${requester._id} has set hasViewed:${follwing} on follower request with ${receiver._id}`;
// 	}

// 	async getFriends(user, option = 'all') {
// 		// all, following, notFollowing
// 		let elMatch = {};
// 		switch (option) {
// 			case 'all':
// 				elMatch = { _id: user._id };
// 				break;
// 			case 'following':
// 				elMatch = { _id: user._id, isFollowing: true };
// 				break;
// 			case 'notFollowing':
// 				elMatch = { _id: user._id, isFollowing: false };
// 				break;
// 			default:
// 				throw new Error(`such option:${option} does not exist`);
// 		}
// 		let rv = await Follower.find(
// 			{ isFriends: true, users: { $elemMatch: elMatch } },
// 			'users._id users.nickname',
// 			{ lean: true }
// 		);

// 		let arr = [];
// 		if (rv && rv.length > 0) {
// 			for (let elem of rv) {
// 				for (let el of elem.users) {
// 					if (el._id != user._id) arr.push(el);
// 				}
// 			}
// 		}
// 		return arr;
// 	}

// 	async getPending(user, viewed = false) {
// 		let rv = await Follower.find(
// 			{
// 				users: {
// 					$elemMatch: { _id: user._id, isPending: true, hasViewed: viewed },
// 				},
// 			},
// 			'users._id users.nickname',
// 			{ lean: true }
// 		);

// 		let arr = [];
// 		for (let elem of rv) {
// 			for (let el of elem.users) {
// 				if (el._id != user._id) arr.push(el);
// 			}
// 		}
// 		// log('IN getPending')
// 		// log(arr)
// 		return arr;
// 	}

// 	async _getAll() {
// 		let b = await Follower.find({});
// 		// Follower.find({
// 		// 	users: {
// 		// 		$all: [{ $elemMatch: { _id: 'id1' } }, { $elemMatch: { _id: 'id2' } }],
// 		// 	},
// 		// }).lean()
// 		// log(b)

// 		log('============== IN getAll ==============');
// 		for (let elem of b) {
// 			// log(b)
// 			log(elem);
// 		}
// 		log('============== getAll DONE ==============');
// 		return new Promise((resolve, reject) => {
// 			resolve();
// 		});
// 	}

// 	_getDocId(u0, u1) {
// 		return getDocId(u0, u1);
// 	}
// };
