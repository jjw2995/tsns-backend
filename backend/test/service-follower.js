// // require('../db')
// const chai = require('chai');
// const mongoose = require('mongoose');
// const Friend = mongoose.model('Follower');
// const { FollowerService } = require('../services');
// const { should, expect } = require('chai');

// let followerService = new FollowerService(Friend);

// // chai.use(require('chai-http'))
// // let should = should
// let log = (m) => console.log('\n', m, '\n');

// let u1 = { nickname: 'u1', _id: 'id1' };
// let u2 = { nickname: 'u2', _id: 'id2' };
// let u3 = { nickname: 'u3', _id: 'id3' };
// let u4 = { nickname: 'u4', _id: 'id4' };
// let u5 = { nickname: 'u5', _id: 'id5' };
// let u6 = { nickname: 'u6', _id: 'id6' };

// before('asd', async () => {
// 	let dbp = 'mongodb://localhost:27017';
// 	await mongoose.connect(dbp, {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 		useCreateIndex: true,
// 		useFindAndModify: false,
// 	});
// 	// await Friend.collection.dropIndexes()
// 	await dbReset();
// });

// after(async () => {
// 	await dbReset();
// 	await mongoose.disconnect();
// });

// async function dbReset() {
// 	await Friend.deleteMany({});
// }

// // async function addFriendReqRec(req, rec) {
// // 	let a = await followerService.addFriend(req, rec);
// // 	return a;
// // }

// // describe.only('followerService', () => {
// // 	describe('.addFriend', () => {
// // 		//setup()
// // 		afterEach(async () => {
// // 			// getAll()
// // 			dbReset();
// // 		});

// // 		it('u1 add u2		=> u1 requested, u2 pending', (done) => {
// // 			addFriendReqRec(u1, u2).then((rv) => {
// // 				expect(rv).to.eql({ requestComplete: { requester: u1, receiver: u2 } });
// // 				done();
// // 			});
// // 		});

// // 		it('u1 add u1		=> should not add self as friend, reject', (done) => {
// // 			addFriendReqRec(u1, u1).catch((rv) => {
// // 				expect(rv.message).to.have.string(
// // 					`Cannot add oneself in a friend request`
// // 				);
// // 				done();
// // 			});
// // 		});

// // 		it('u1 add u2, u2 add u1	=> u1 u2 requested, isFriends true', (done) => {
// // 			addFriendReqRec(u1, u2).then((rv1) => {
// // 				addFriendReqRec(u2, u1).then((rv2) => {
// // 					expect(rv2.friends).to.include.members([u1, u2]);
// // 					done();
// // 				});
// // 			});
// // 		});

// // 		it('u1 add u2, u1 add u2 	=> should be rejected isFriends false', (done) => {
// // 			addFriendReqRec(u1, u2).then((rv1) => {
// // 				addFriendReqRec(u1, u2).catch((rv2) => {
// // 					expect(rv2.message).to.have.string(
// // 						`${u1._id} has already requested friend request`
// // 					);
// // 					done();
// // 				});
// // 			});
// // 		});

// // 		it('u4 add u2		=> checking users: [u1, u4] order', (done) => {
// // 			addFriendReqRec(u1, u4).then((rv) => {
// // 				expect(rv).to.eql({ requestComplete: { requester: u1, receiver: u4 } });
// // 				done();
// // 			});
// // 		});
// // 	});

// // 	describe('.setRequestViewed', async () => {
// // 		before(async () => {
// // 			await addFriendReqRec(u5, u1); // pending viewed
// // 		});

// // 		it('set viewed True', async () => {
// // 			let viewed = true;
// // 			let rv = await followerService.setRequestViewed(u1, u5, viewed);
// // 			expect(rv).to.be.equal(
// // 				`${u1._id} has set hasViewed:${viewed} on friend request with ${u5._id}`
// // 			);
// // 		});
// // 		it('set viewed False', async () => {
// // 			let viewed = false;
// // 			let rv = await followerService.setRequestViewed(u1, u5, viewed);
// // 			expect(rv).to.be.equal(
// // 				`${u1._id} has set hasViewed:${viewed} on friend request with ${u5._id}`
// // 			);
// // 		});
// // 		it('set viewed with non-existing user, reject', async () => {
// // 			let viewed = true;

// // 			followerService.setRequestViewed(u1, u3, viewed).catch((e) => {
// // 				expect(e).to.be.an.instanceOf(Error);
// // 				expect(e.message).equal(
// // 					`setRequestViewed from ${u1._id} -> ${u3._id}: either such users not exist OR friend request has not yet been made`
// // 				);
// // 			});
// // 		});
// // 	});
// // 	describe('.getPending', () => {
// // 		//setup()

// // 		before(async () => {
// // 			await dbReset();
// // 			await addFriendReqRec(u1, u2);
// // 			await addFriendReqRec(u2, u1); // friends
// // 			await addFriendReqRec(u3, u1); // pending
// // 			await addFriendReqRec(u4, u1); // pending
// // 			await addFriendReqRec(u5, u1); // pending viewed
// // 			await followerService.setRequestViewed(u1, u5, true);
// // 		});

// // 		it('viewed = false (default)  => u1 should see u3, u4', async () => {
// // 			// await getAll()
// // 			let list = await followerService.getPending(u1);
// // 			expect(list).to.eql([u3, u4]);
// // 		});

// // 		it('viewed = true		  => u1 should only see u5', async () => {
// // 			// await getAll()
// // 			let list = await followerService.getPending(u1, true);
// // 			expect(list).to.eql([u5]);
// // 		});
// // 	});

// // 	describe('.setFollowing', async () => {
// // 		//setup()
// // 		before(async () => {
// // 			await dbReset();
// // 			await addFriendReqRec(u5, u1);
// // 			await addFriendReqRec(u1, u5);
// // 		});

// // 		it('set following False', async () => {
// // 			let viewed = false;
// // 			let rv = await followerService.setFollowing(u1, u5, viewed);
// // 			expect(rv).to.be.equal(
// // 				`${u1._id} has set hasViewed:${viewed} on friend request with ${u5._id}`
// // 			);
// // 		});

// // 		it('set following True', async () => {
// // 			let viewed = true;
// // 			let rv = await followerService.setFollowing(u1, u5, viewed);
// // 			expect(rv).to.be.equal(
// // 				`${u1._id} has set hasViewed:${viewed} on friend request with ${u5._id}`
// // 			);
// // 		});
// // 		it('set following with non-existing user/friendDoc, reject', async () => {
// // 			let viewed = true;

// // 			followerService.setFollowing(u1, u3, viewed).catch((e) => {
// // 				expect(e).to.be.an.instanceOf(Error);
// // 				expect(e.message).equal(
// // 					`setFollowing from ${u1._id} -> ${u3._id}: either such users not exist OR are not friends yet`
// // 				);
// // 			});
// // 		});
// // 	});

// // 	// let u5 = { nickname: 'u5', _id: 'id5' }
// // 	// let u6 = { nickname: 'u6', _id: 'id6' }
// // 	describe('.getFriends', async () => {
// // 		//setup()

// // 		before('HERE', async () => {
// // 			// u1 <-> u2
// // 			// u1 <-> u3
// // 			// u1(not following) <-> u4
// // 			// u1 <- u5
// // 			await dbReset();
// // 			await addFriendReqRec(u1, u2);
// // 			await addFriendReqRec(u2, u1);

// // 			await addFriendReqRec(u3, u1);
// // 			await addFriendReqRec(u1, u3);

// // 			await addFriendReqRec(u4, u1);
// // 			await addFriendReqRec(u1, u4);

// // 			await addFriendReqRec(u5, u1);
// // 			await followerService.setFollowing(u1, u4, false);
// // 		});
// // 		it("u1 get 'all' (default) friends - get u2, u3, u4", async () => {
// // 			let a = await followerService.getFriends(u1);
// // 			expect(a).to.eql([u2, u3, u4]);
// // 		});
// // 		it("u1 get 'follwing' friends - get u2, u3", async () => {
// // 			let a = await followerService.getFriends(u1, 'following');
// // 			expect(a).to.eql([u2, u3]);
// // 		});

// // 		it("u1 get 'notFollwing' friends - get u4", async () => {
// // 			let a = await followerService.getFriends(u1, 'notFollowing');
// // 			expect(a).to.eql([u4]);
// // 		});

// // 		it('get friends for u6 no pending, should get []', async () => {
// // 			let a = await followerService.getFriends(u6);
// // 			expect(a).to.eql([]);
// // 			// expect(a.users).to.eql([u2, u3])
// // 		});
// // 		it('get friends for u5 one pending no friends, should get []', async () => {
// // 			let a = await followerService.getFriends(u5);
// // 			expect(a).to.eql([]);
// // 			// expect(a.users).to.eql([u2, u3])
// // 		});
// // 	});

// // 	describe('.deleteFriend & .removeFriendRequest', () => {
// // 		beforeEach('HERE', async () => {
// // 			// u1 <-> u2
// // 			// u1 <-> u3
// // 			// u1(not following) <-> u4
// // 			// u1 <- u5
// // 			await dbReset();

// // 			await addFriendReqRec(u1, u2);
// // 			await addFriendReqRec(u2, u1);

// // 			await addFriendReqRec(u5, u1);
// // 		});

// // 		it('.deleteFriend 		= not friend, fail to delete', (done) => {
// // 			followerService.deleteFriend(u5, u1).catch((e) => {
// // 				expect(e).to.be.an.instanceOf(Error);
// // 				expect(e.message).to.have.string(
// // 					`friend document between ${u5._id} and ${u1._id} never existed OR wrong id`
// // 				);
// // 				done();
// // 			});
// // 		});

// // 		it('.deleteFriend 		= friend, delete', (done) => {
// // 			followerService.deleteFriend(u1, u2).then((r) => {
// // 				// log(r)
// // 				expect(r).to.have.string(
// // 					`friend document ${followerService._getDocId(
// // 						u1,
// // 						u2
// // 					)} has been deleted`
// // 				);
// // 				done();
// // 			});
// // 		});

// // 		it('.removeFriendRequest	= not friend, delete', (done) => {
// // 			followerService.removeFriendRequest(u5, u1).then((r) => {
// // 				expect(r).to.have.string(
// // 					`friend document ${followerService._getDocId(
// // 						u5,
// // 						u1
// // 					)} has been deleted`
// // 				);
// // 				done();
// // 			});
// // 		});

// // 		it('.removeFriendRequest	= friend, fail delete', (done) => {
// // 			followerService.removeFriendRequest(u2, u1).catch((e) => {
// // 				expect(e).to.be.an.instanceOf(Error);
// // 				expect(e.message).to.have.string(
// // 					`friend document between ${u2._id} and ${u1._id} never existed OR wrong id`
// // 				);
// // 				done();
// // 			});
// // 		});
// // 	});
// // });
