// const chai = require('chai');
// const app = require('../app');
// const mongoose = require('mongoose');
// const User = mongoose.model('User');
// const Follower = mongoose.model('Follower');
// const Post = mongoose.model('Post');
// const Reaction = mongoose.model('Reaction');

// // const {} = require('../services/service-follower');

// chai.use(require('chai-http'));

// let server;

// before(async () => {
// 	server = await chai.request(app).keepOpen();
// 	// await new Promise((r) => setTimeout(r, 200));
// });

// let validUser1 = {
// 	nickname: 'user1',
// 	email: 'example@qwerty.com',
// 	password: 'dD1@dasdf',
// };

// let validUser2 = {
// 	nickname: 'user2',
// 	email: 'examp1le@qwerty.com',
// 	password: 'dD1@dasdf',
// };

// let validPrivateUser = {
// 	nickname: 'privateUser',
// 	email: 'exampdle@qwerty.com',
// 	password: 'dD1@dasdf',
// 	isPrivate: true,
// };

// // let user
// let privUser;
// let user1;
// let user2;
// let fakeUser = { _id: '5f38bfae4b1b3d3100e431a3', nickname: 'qwe' };

// let postFollowers = {
// 	description: 'followers',
// 	media: ['asf'],
// 	level: 'followers',
// };

// let postPrivate = { description: 'private', media: ['fasf'], level: 'private' };

// let postPublic = { description: 'public', media: ['qwrs'], level: 'public' };

// let log = (msg) => console.log('\n\n', msg);

// let accessToken;
// let refreshToken;

// function logRes(res, method = '') {
// 	console.log(
// 		'\n\n\n',
// 		method,
// 		'\n\n',
// 		'STATUS:\n	',
// 		res.status,
// 		'\n',
// 		'HEADER:\n	',
// 		res.header,
// 		'\n',
// 		'BODY:\n	',
// 		res.body,
// 		'\n'
// 	);
// }

// function getAuthBear(u) {
// 	return { authorization: 'Bearer ' + u.accessToken };
// }

// async function init(users) {
// 	for (let i = 0; i < users.length; i++) {
// 		await server.post('/api/auth/register').send(users[i]);
// 		let r = await server.post('/api/auth/login').send(users[i]);
// 		// log(r.body);
// 		users[i]._id = r.body._id;
// 		users[i].accessToken = r.body.accessToken;
// 		users[i].refreshToken = r.body.refreshToken;
// 	}
// 	return users;
// }
// describe('rapid Dev', () => {
// 	beforeEach(async () => {
// 		await User.deleteMany({});
// 		await Follower.deleteMany({});
// 		await Reaction.deleteMany({});
// 		[user1, user2, privUser] = await init([
// 			validUser1,
// 			validUser2,
// 			validPrivateUser,
// 		]);
// 	});
// 	describe('endpoints of /api/followers', () => {
// 		describe('POST /api/followers', () => {
// 			it('', async () => {
// 				let a = await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					// .send(privUser);
// 					.send(user1);

// 				logRes(a);
// 			});
// 			it('', async () => {
// 				let a = await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					// .send(privUser);
// 					.send(fakeUser);
// 				logRes(a);
// 			});
// 			it('', async () => {
// 				let a = await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(user2);
// 				logRes(a);
// 			});
// 			it('', async () => {
// 				let a = await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(privUser);
// 				logRes(a);
// 			});
// 		});

// 		describe('DELETE /api/followers', () => {
// 			beforeEach(async () => {
// 				await server.post('/api/followers').set(getAuthBear(user1)).send(user2);
// 				await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(privUser);
// 				log(await Follower.find({}));
// 			});
// 			afterEach(async () => {
// 				log(await Follower.find({}));
// 			});
// 			it('', async () => {
// 				let a = await server
// 					.delete('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(user1);
// 			});

// 			it('', async () => {
// 				let a = await server
// 					.delete('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(fakeUser);
// 			});

// 			it('', async () => {
// 				let a = await server
// 					.delete('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(user2);
// 			});

// 			it('', async () => {
// 				let a = await server
// 					.delete('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(privUser);
// 			});
// 		});

// 		describe('GET /api/followers & /api/followers/pending', () => {
// 			beforeEach(async () => {
// 				await server.post('/api/followers').set(getAuthBear(user1)).send(user2);
// 				await server
// 					.post('/api/followers')
// 					.set(getAuthBear(user1))
// 					.send(privUser);
// 				// log(await Follower.find({}));
// 			});

// 			it('/api/followers [user1]', async () => {
// 				log(user1._id);
// 				log(user2);
// 				let a = await server.get('/api/followers').set(getAuthBear(user1));
// 				logRes(a);
// 			});

// 			it('/api/followers [ ]', async () => {
// 				let a = await server.get('/api/followers').set(getAuthBear(user2));
// 				logRes(a);
// 			});

// 			// ==============================

// 			it('/api/followers/waiting [user1]', async () => {
// 				let a = await server
// 					.get('/api/followers/waiting')
// 					.set(getAuthBear(user1));
// 				logRes(a);
// 			});

// 			// ==============================

// 			it('/api/followers/pending [user1]', async () => {
// 				// log(privUser);
// 				let a = await server
// 					.get('/api/followers/pending')
// 					.set(getAuthBear(privUser));
// 				logRes(a);
// 			});

// 			it('/api/followers/pending [ ]', async () => {
// 				// log(privUser);
// 				let a = await server
// 					.get('/api/followers/pending')
// 					.set(getAuthBear(user2));
// 				logRes(a);
// 			});

// 			// ==============================

// 			it('/api/followers/accept', async () => {
// 				// log(privUser);
// 				log(await Follower.find({}));

// 				let a = await server
// 					.post('/api/followers/accept')
// 					.set(getAuthBear(privUser))
// 					.send(user1);
// 				log(await Follower.find({}));

// 				logRes(a);
// 			});
// 		});
// 	});

// 	describe('endpoints of /api/posts', () => {
// 		beforeEach(async () => {
// 			await server.post('/api/followers').set(getAuthBear(user1)).send(user2);
// 			await server
// 				.post('/api/followers')
// 				.set(getAuthBear(user1))
// 				.send(privUser);
// 			// await server.post;
// 		});

// 		describe('/api/posts', () => {
// 			// it('POST /api/posts', async () => {
// 			// 	let a = await server
// 			// 		.post('/api/posts')
// 			// 		.set(getAuthBear(user1))
// 			// 		.send(postPublic);
// 			// 	logRes(a);
// 			// });
// 			async function populatePosts(user) {
// 				await server.post('/api/posts').set(getAuthBear(user)).send(postPublic);
// 				await server
// 					.post('/api/posts')
// 					.set(getAuthBear(user))
// 					.send(postFollowers);
// 				await server
// 					.post('/api/posts')
// 					.set(getAuthBear(user))
// 					.send(postPrivate);
// 			}
// 			beforeEach(async () => {
// 				await Post.deleteMany({});
// 				await populatePosts(user1);
// 				await populatePosts(user2);
// 				await populatePosts(privUser);
// 			});
// 			it('GET /api/posts', async () => {
// 				// log(await Post.find({}));
// 				await server
// 					.post('/api/followers/accept')
// 					.set(getAuthBear(privUser))
// 					.send(user1);
// 				let a = await server.get('/api/posts/').set(getAuthBear(user1));
// 				logRes(a);
// 			});

// 			it('GET /api/posts/explore', async () => {
// 				// log(await Post.find({}));
// 				await server;
// 				let a = await server.get('/api/posts/explore').set(getAuthBear(user1));
// 				logRes(a);
// 			});

// 			it('PATCH /api/posts/', async () => {
// 				// _id
// 				// description
// 				// media
// 				// level
// 				let post = await server
// 					.post('/api/posts')
// 					.set(getAuthBear(user1))
// 					.send(postFollowers);
// 				post = post.body;
// 				post.level = 'private';
// 				let a = await server
// 					.patch('/api/posts')
// 					.set(getAuthBear(user1))
// 					.send(post);
// 				let b = await server
// 					.delete('/api/posts')
// 					.set(getAuthBear(user1))
// 					.send(post);
// 				logRes(b);
// 			});

// 		// describe('/api/posts', () => {
// 		// 	it('GET /api/posts', async () => {
// 		// 		// log(user1._id);
// 		// 		// log(user2);
// 		// 		let a = await server.get('/api/followers').set(getAuthBear(user1));
// 		// 		logRes(a);
// 		// 	});
// 		// });
// 	});
// });
