// auth
// follower
// post
// comment
// reaction
// user

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../app');
const fs = require('fs');

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Follower = mongoose.model('Follower');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const Reaction = mongoose.model('Reaction');

chai.use(chaiHttp);

let {
	user_1,
	user_2,
	privateUser_1,
	privateUser_2,
	postPublic,
	postFollowers,
	postPrivate,
} = require('./variables');

let server;

before(() => {
	server = chai.request(app).keepOpen();
});

function postAppendNick(user, post) {
	let a = JSON.parse(JSON.stringify(post));
	a.description = user.nickname + '_' + post.description;
	return a;
}

function getAuthBear(user) {
	return { authorization: 'Bearer ' + user.accessToken };
}

function logRes(res, method = '') {
	console.log(
		method,
		'\n',
		'STATUS:\n	',
		res.status,
		'\n',
		'HEADER:\n	',
		res.header,
		'\n\n',
		'BODY:\n	',
		res.body,
		'\n\n\n'
	);
}

function log(msg) {
	console.log('\n\n', msg);
}

function expToHaveProps(value, propsArr) {
	for (const iterator of propsArr) {
		expect(value).to.have.property(iterator);
	}
}

async function regAndLogin(user, is_private = false) {
	user = {
		nickname: user.nickname,
		email: user.email,
		password: user.password,
	};
	let asd = await server.post('/api/auth/register').send(user);
	// logRes(asd);
	let temp = JSON.parse(JSON.stringify(user));
	delete temp.nickname;
	// log(user);
	let a = await server.post('/api/auth/login').send(temp);
	// log(a.body);
	user._id = a.body._id;
	user.accessToken = a.body.accessToken;
	user.refreshToken = a.body.refreshToken;
	if (is_private) {
		let a = await server
			.post('/api/users/private')
			.set(getAuthBear(user))
			.send({ isPrivate: is_private });
		// logRes(a);
	}
	return user;
}

function getAuthBear(u) {
	// log(u);
	return { authorization: 'Bearer ' + u.accessToken };
}

beforeEach(async () => {
	// log('in b4Each reset');

	await User.deleteMany({});
	await Follower.deleteMany({});
	await Post.deleteMany({});
	await Comment.deleteMany({});
	await Reaction.deleteMany({});
});
// describe('/api', () => {
describe('/api/auths', () => {
	describe('POST /register', () => {
		it('correct input', async () => {
			// user_1.asd = 'asd';
			let a = await server.post('/api/auth/register').send(user_1);
			// logRes(a);
			expToHaveProps(a.body, ['_id', 'nickname']);
		});
		it('incorrect inputs', async () => {
			let invalNick = JSON.parse(JSON.stringify(user_1));
			let invalPass = JSON.parse(JSON.stringify(user_1));
			let invalEmail = JSON.parse(JSON.stringify(user_1));
			// invalNick.nickname = 'd';
			delete invalNick.nickname;
			delete invalPass.password;
			delete invalEmail.email;

			invalNick.nickname = 'd';
			invalPass.password = 'asd';
			invalEmail.email = 'das';
			invalEmail.nickname = 'd';

			let a = await server.post('/api/auth/register').send(invalNick);
			let b = await server.post('/api/auth/register').send(invalPass);
			let c = await server.post('/api/auth/register').send(invalEmail);
			// logRes(a);
			// logRes(b);
			// logRes(c);
			expect(a.status).to.eql(400);
			expect(b.status).to.eql(400);
			expect(c.status).to.eql(400);
		});
		it('email already taken', async () => {
			await server.post('/api/auth/register').send(user_1);
			let a = await server.post('/api/auth/register').send(user_1);
			// logRes(a);
			expect(a.status).to.eql(400);
		});
	});
	describe('POST /login', () => {
		beforeEach(async () => {
			await server.post('/api/auth/register').send(user_1);
		});
		it('correct login', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));
			delete temp.nickname;
			let a = await server.post('/api/auth/login').send(temp);
			// logRes(a);
			expToHaveProps(a.body, [
				'_id',
				'nickname',
				'accessToken',
				'refreshToken',
			]);
		});

		it('wrong password', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));
			delete temp.nickname;
			temp.password = 'as!2aDfsd';
			let a = await server.post('/api/auth/login').send(temp);
			expect(a.status).to.eql(400);
		});
		it('wrong email', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));
			delete temp.nickname;
			temp.email = 'as!2aDfsd@gnal.com';
			let a = await server.post('/api/auth/login').send(temp);
			expect(a.status).to.eql(400);
		});
	});
	describe('POST /logout', () => {
		beforeEach(async () => {
			user_1 = await regAndLogin(user_1);
		});
		it('correct logout', async () => {
			// log(user_1);
			let temp = JSON.parse(JSON.stringify(user_1));
			delete temp.nickname;

			let a = await server.post('/api/auth/logout').send(temp);
			expect(a.status).to.eql(204);
		});
		it('wrong refreshToken', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));
			delete temp.nickname;
			temp.refreshToken =
				'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNjYTY0Y2M1NjVjMjA1MzlkODJhY2EiLCJuaWNrbmFtZSI6InVzZXIxIiwiaWF0IjoxNTk3ODEwMjUyLCJleHAiOjE1OTg0MTUwNTJ9.FcBESGe13duFGHzerVCqwHzFvtFqZ-fxpIgdku7CJE';

			let a = await server.post('/api/auth/logout').send(temp);

			delete temp.refreshToken;
			let b = await server.post('/api/auth/logout').send(temp);
			// let c = await server.post('/api/auth/logout').send(temp);
			// logRes(a);
			// logRes(b);
			expect(a.status).to.eql(401);
			expect(b.status).to.eql(401);
		});
	});
	describe('POST /token', () => {
		beforeEach(async () => {
			user_1 = await regAndLogin(user_1);
		});
		it('correct request', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));
			// delete temp.nickname;

			let a = await server.post('/api/auth/token').send(temp);
			// logRes(a);
			expect(a.status).to.eql(200);
		});
		it('wrong refreshToken/inputs', async () => {
			let temp = JSON.parse(JSON.stringify(user_1));

			await server.post('/api/auth/logout').send(temp);
			let a = await server.post('/api/auth/token').send(temp);
			// logRes(a);
			expect(a.status).to.eql(401);

			delete temp.nickname;
			temp.refreshToken =
				'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNjYTY0Y2M1NjVjMjA1MzlkODJhY2EiLCJuaWNrbmFtZSI6InVzZXIxIiwiaWF0IjoxNTk3ODEwMjUyLCJleHAiOjE1OTg0MTUwNTJ9.FcBESGe13duFGHzerVCqwHzFvtFqZ-fxpIgdku7CJE';

			let b = await server.post('/api/auth/token').send(temp);
			// logRes(b);
			expect(b.status).to.eql(401);

			delete temp.refreshToken;
			let c = await server.post('/api/auth/token').send(temp);
			// logRes(c);
			expect(c.status).to.eql(401);
		});
	});
});

async function postFollow(req, other) {
	return await server.post('/api/followees/').set(getAuthBear(req)).send(other);
}

usersInit = async () => {
	user_1 = await regAndLogin(user_1);
	user_2 = await regAndLogin(user_2);
	privateUser_1 = await regAndLogin(privateUser_1, true);
	privateUser_2 = await regAndLogin(privateUser_2, true);

	// log(user_1);
};

let userPrivPubFolPost = async (user) => {
	await server
		.post('/api/posts')
		.set(getAuthBear(user))
		.send(postAppendNick(user, postPublic));
	await server
		.post('/api/posts')
		.set(getAuthBear(user))
		.send(postAppendNick(user, postFollowers));
	await server
		.post('/api/posts')
		.set(getAuthBear(user))
		.send(postAppendNick(user, postPrivate));
};
async function acceptFollower(user, follower) {
	await server
		.post('/api/followers/accept')
		.set(getAuthBear(user))
		.send(follower);
}

describe('/api/*, those that need authed users', () => {
	beforeEach(async () => {
		await usersInit();
	});
	describe('/followers /followees', () => {
		describe('POST /followees', () => {
			it('correct input', async () => {
				let a = await server
					.post('/api/followees')
					.set(getAuthBear(user_1))
					.send({ _id: user_2._id });
				// logRes(a);
				expect(a.status).to.eql(200);
				expect(a.body.isPending).to.eql(false);
			});
			it('correct, private user', async () => {
				let a = await server
					.post('/api/followees')
					.set(getAuthBear(user_1))
					.send({ _id: privateUser_1._id });
				// logRes(a);
				expect(a.status).to.eql(200);
				expect(a.body.isPending).to.eql(true);
			});
			it('req twice, ', async () => {
				await server
					.post('/api/followees')
					.set(getAuthBear(user_1))
					.send({ _id: privateUser_1._id });
				let a = await server
					.post('/api/followees')
					.set(getAuthBear(user_1))
					.send({ _id: privateUser_1._id });
				// logRes(a);
				expect(a.status).to.eql(400);
			});
			it('no such user', async () => {
				let a = await server
					.post('/api/followees')
					.set(getAuthBear(user_1))
					.send({ _id: '5f38bfae4b1b3d3100e431a3' });
				// logRes(a);
				expect(a.status).to.eql(400);
			});
		});

		describe('follower init', () => {
			beforeEach('followers init, u1 -> u2, u1-> pu1', async () => {
				let a = await postFollow(user_1, user_2);
				let b = await postFollow(user_1, privateUser_1);
				// logRes(a);
				// logRes(b);
			});

			describe('GET /followees', () => {
				it('should get user2', async () => {
					let a = await server.get('/api/followees').set(getAuthBear(user_1));
					// logRes(a);
					// log(a);
					expect(a.body[0]._id).to.eql(user_2._id);
				});
				it('should get 0 followees', async () => {
					let a = await server
						.get('/api/followees')
						.set(getAuthBear(privateUser_1));
					// logRes(a);
					expect(a.body.length).to.eql(0);
				});
			});
			describe('GET /followees/pending', () => {
				it('user_1 should get privateUser_1', async () => {
					let a = await server
						.get('/api/followees/pending')
						.set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body[0]._id).to.eql(privateUser_1._id);
				});
				it('user_1 should get 2 users', async () => {
					await postFollow(user_1, privateUser_2);

					let a = await server
						.get('/api/followees/pending')
						.set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body.length).to.eql(2);
				});
			});
			describe('GET /followers', () => {
				it('user_2 should get user_1', async () => {
					let a = await server.get('/api/followers').set(getAuthBear(user_2));
					// logRes(a);
					expect(a.body[0]._id).to.eql(user_1._id);
				});
				it('privateUser_1 should get 0 users', async () => {
					await postFollow(privateUser_2, privateUser_1);
					let a = await server
						.get('/api/followers')
						.set(getAuthBear(privateUser_1));
					// logRes(a);

					expect(a.body.length).to.eql(0);
				});
			});

			describe('GET /followers/pending', () => {
				it('privateUser_1 should get user_1', async () => {
					let a = await server
						.get('/api/followers/pending')
						.set(getAuthBear(privateUser_1));
					// logRes(a);
					expect(a.body[0]._id).to.eql(user_1._id);
				});
				it('privateUser_1 should get 2 users', async () => {
					await postFollow(privateUser_2, privateUser_1);

					let a = await server
						.get('/api/followers/pending')
						.set(getAuthBear(privateUser_1));
					// logRes(a);
					expect(a.body.length).to.eql(2);
				});
			});

			describe('POST /followers/accept', () => {
				it('privateUser_1 accepts user_1', async () => {
					let a = await server
						.post('/api/followers/accept')
						.set(getAuthBear(privateUser_1))
						.send(user_1);
					// logRes(a);
					expect(a.body.isPending).to.eql(false);
					expect(a.body.follower._id).to.eql(user_1._id);
				});
				it('privateUser_1 accepts user_1 twice, error', async () => {
					await server
						.post('/api/followers/accept')
						.set(getAuthBear(privateUser_1))
						.send(user_1);
					let a = await server
						.post('/api/followers/accept')
						.set(getAuthBear(privateUser_1))
						.send(user_1);
					// logRes(a);
					expect(a.status).to.eql(400);
				});
				it('user_1 accepts user_1, error', async () => {
					let a = await server
						.post('/api/followers/accept')
						.set(getAuthBear(user_2))
						.send(user_1);
					// logRes(a);
					expect(a.status).to.eql(400);
				});
			});

			describe('DELETE /followees', () => {
				it('user_1 deletes user_2', async () => {
					let a = await server
						.delete('/api/followees')
						.set(getAuthBear(user_1))
						.send(user_2);
					// logRes(a);
					expect(a.body.followee._id).to.eql(user_2._id);
				});
				it('user_1 deletes privateUser_1', async () => {
					let a = await server
						.delete('/api/followees')
						.set(getAuthBear(user_1))
						.send(privateUser_1);
					// logRes(a);
					// expect(a.body.isPending).to.eql(false);
					expect(a.body.followee._id).to.eql(privateUser_1._id);
				});
			});

			describe('DELETE /followers', () => {
				it('user_2 deletes user_1', async () => {
					let a = await server
						.delete('/api/followers')
						.set(getAuthBear(user_2))
						.send(user_1);
					// logRes(a);
					expect(a.body.follower._id).to.eql(user_1._id);
				});

				it('privateUser_1 deletes user_1, error', async () => {
					let a = await server
						.delete('/api/followers')
						.set(getAuthBear(privateUser_1))
						.send(user_1);
					// logRes(a);
					expect(a.status).to.eql(400);
				});
			});
		});
	});
	describe('/posts', () => {
		beforeEach('followers init, u1 -> u2, u1-> pu1', async () => {
			// await usersInit();
			let a = await postFollow(user_1, user_2);
			let b = await postFollow(user_1, privateUser_1);
			// logRes(a);
			// logRes(b);
		});

		// user_1
		// user_2,
		// privateUser_1,
		// privateUser_2,
		// postFollowers,
		// postPrivate,
		// postPublic,

		describe('POST', () => {
			it('normal', async () => {
				let a = await server
					.post('/api/posts')
					.set(getAuthBear(user_1))
					.send(postAppendNick(user_1, postPublic));
				// logRes(a);
				let b = await server
					.post('/api/posts')
					.set(getAuthBear(user_1))
					.send(postAppendNick(user_1, postFollowers));
				// logRes(b);
				let c = await server
					.post('/api/posts')
					.set(getAuthBear(user_1))
					.send(postAppendNick(user_1, postPrivate));
				// logRes(c);
			});
			it.only('TEST', async () => {
				let a = await server
					.post('/api/posts')
					.set(getAuthBear(user_1))
					// .attach()
					.attach('f_1', fs.readFileSync('./z.png'), 'z.png')
					.attach('f_2', fs.readFileSync('./test1.png'), 'test1.png')
					// .attach('t_1', fs.readFileSync('./text.png'), 'text.png')
					.field(postPrivate);
				//
				// .send(postAppendNick(user_1, postPrivate));
				// chai.request().post().field().attach();
				logRes(a);
			});
			it('TEST', async () => {
				let a = await server
					.post('/api/posts')
					.set(getAuthBear(user_1))
					// .attach()
					.attach('f_1', fs.readFileSync('./z.png'), 'z.png')
					.attach('f_2', fs.readFileSync('./test1.png'), 'test1.png')
					.attach('t_1', fs.readFileSync('./text.png'), 'text.png')
					.field(postPublic);
				//
				// .send(postAppendNick(user_1, postPrivate));
				// chai.request().post().field().attach();
				logRes(a);
			});
		});
		describe('those that need posts set up', () => {
			beforeEach(async () => {
				await userPrivPubFolPost(user_1);
				await userPrivPubFolPost(user_2);
				await userPrivPubFolPost(privateUser_1);
			});
			describe('GET', () => {
				it("fetch user_1's home posts", async () => {
					let a = await server.get('/api/posts').set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body.length).eql(5);
				});

				it("fetch user_1's home posts after privateUser_1 accepts user_1", async () => {
					await acceptFollower(privateUser_1, user_1);
					let a = await server.get('/api/posts').set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body.length).eql(7);
				});
				it("fetch privateUser_2's home posts", async () => {
					let a = await server
						.get('/api/posts')
						.set(getAuthBear(privateUser_2));
					// logRes(a);
					expect(a.body.length).eql(0);
				});
				it("fetch user_2's home posts", async () => {
					let a = await server.get('/api/posts').set(getAuthBear(user_2));
					// logRes(a);
					expect(a.body.length).eql(3);
				});
			});
			describe('GET /explore', () => {
				it("fetch user_1's explore posts", async () => {
					let a = await server
						.get('/api/posts/explore')
						.set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body.length).eql(3);
				});

				it("fetch user_1's explore posts after privateUser_1 accepts user_1", async () => {
					await acceptFollower(privateUser_1, user_1);
					let a = await server
						.get('/api/posts/explore')
						.set(getAuthBear(user_1));
					// logRes(a);
					expect(a.body.length).eql(3);
				});
				it("fetch privateUser_2's explore posts", async () => {
					let a = await server
						.get('/api/posts/explore')
						.set(getAuthBear(privateUser_2));
					// logRes(a);
					expect(a.body.length).eql(3);
				});
				it("fetch user_2's explore posts", async () => {
					let a = await server
						.get('/api/posts/explore')
						.set(getAuthBear(user_2));
					// logRes(a);
					expect(a.body.length).eql(3);
				});
			});
			describe('GET /mine', () => {
				it("fetch user_1's own posts", async () => {
					let a = await server.get('/api/posts/mine').set(getAuthBear(user_1));
					logRes(a);
					// expect(a.body.length).eql(3);
				});
				it("fetch privateUser_2's own posts", async () => {
					let a = await server
						.get('/api/posts/mine')
						.set(getAuthBear(privateUser_2));
					logRes(a);
					// expect(a.body.length).eql(0);
				});
			});
			describe('DELETE', () => {
				// it("fetch user_1's own posts", async () => {
				// 	let a = await server.get('/api/posts/mine').set(getAuthBear(user_1));
				// 	logRes(a);
				// 	// expect(a.body.length).eql(3);
				// });
			});
			describe('PATCH', () => {});
		});
	});
	// describe('/comments', () => {
	// 	describe('POST', () => {});
	// 	describe('DELETE', () => {});
	// 	describe('PATCH', () => {});
	// 	describe('GET', () => {});
	// });
	// describe('/reactions', () => {});
	// describe('/users', () => {});

	// user_1
	// user_2,
	// privateUser_1,
	// privateUser_2,
	// postFollowers,
	// postPrivate,
	// postPublic,
});

// let user_1 = {
// 	nickname: 'user1',
// 	email: 'user_1@qwerty.com',
// 	password: 'dD1@dasdf',
// };
// let user_2 = {
// 	nickname: 'user2',
// 	email: 'user_2@qwerty.com',
// 	password: 'dD1@dasdf',
// };
// let privateUser_1 = {
// 	nickname: 'privateUser1',
// 	email: 'privateUser_1@qwerty.com',
// 	password: 'dD1@dasdf',
// 	// isPrivate: true,
// };
// let privateUser_2 = {
// 	nickname: 'privateUser2',
// 	email: 'privateUser_2@qwerty.com',
// 	password: 'dD1@dasdf',
// 	// isPrivate: true,
// };

// let postFollowers = {
// 	description: 'followers',
// 	media: ['asf'],
// 	level: 'followers',
// };

// let postPrivate = { description: 'private', media: ['fasf'], level: 'private' };

// let postPublic = { description: 'public', media: ['qwrs'], level: 'public' };
