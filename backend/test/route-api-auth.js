const chai = require('chai');
const app = require('../app');
const { assert } = require('chai');
const User = require('mongoose').model('User');

chai.use(require('chai-http'));

const expect = chai.expect;

let userProps = ['_id', 'nickname', 'accessToken', 'refreshToken'];
let log = (msg) => console.log('\n', msg);
let validUser = {
	nickname: 'asfqw',
	email: 'example@qwerty.com',
	password: 'dD1@dasdf',
};

let validUser1 = {
	nickname: 'asfqw',
	email: 'example@qwerty.com',
	password: 'dD1@dasdf',
	someotherfield: 'asf',
};

let invalidUser = {
	password: 'dD1@dasdf',
};

let loginVal = {
	email: 'example@qwerty.com',
	password: 'dD1@dasdf',
};

let loginExtFieldVal = {
	email: 'example@qwerty.com',
	password: 'dD1@dasdf',
	something: 'asf',
};

let loginInvalWrongPass = {
	email: 'example@qwerty.com',
	password: 'dD1@dasf',
};

let loginInvalWrongFieldName1 = {
	email: 'example@qwerty.com',
	passord: 'dD1@dasdf',
};

let loginInvalWrongFieldName2 = {
	emal: 'example@qwerty.com',
	password: 'dD1@dasdf',
};

let loginInvalMissingEmail = {
	passord: 'dD1@dasdf',
};

let loginInvalMissingPass = {
	email: 'example@qwerty.com',
};

let server;

before(async () => {
	server = await chai.request(app).keepOpen();
	// await new Promise((r) => setTimeout(r, 200));
});
// after(() => {
// 	server.close;
// });
describe('/api/auth', () => {
	describe('POST /register', () => {
		beforeEach((done) => {
			User.deleteMany({}, () => {
				done();
			});
		});

		it('register user - has all required input, no miscellaneous fields', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser)
				.end((err, res) => {
					expect(err).to.be.null;
					// log(res);
					expect(res).to.have.status(200);
					// expect(res.body).to.contain(userProps);
					expect(res.body).to.have.keys(userProps);
					done();
				});
		});

		it('register user - has all required input, YES miscellaneous fields', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser1)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.keys(userProps);
					done();
				});
		});

		it('NOT register user - missing required input', (done) => {
			server
				.post('/api/auth/register')
				.send(invalidUser)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					expect(res.body).to.have.property('errors');
					let keyArray = res.body.errors.map((e) => {
						return `${Object.keys(e)}`;
					});
					expect(keyArray).to.have.members(['email', 'nickname']);
					done();
				});
		});

		it('NOT register user - repeated/email already taken', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.keys(userProps);
					next();
					// done();
				});
			function next() {
				server
					.post('/api/auth/register')
					.send(validUser)
					.end((err, res) => {
						expect(err).to.be.null;
						expect(res).to.have.status(400);
						// expect(res.body).to.have.property('errors');
						done();
					});
			}
		});

		// User.deleteMany({}, () => {
		// 	validUser.asd = 'asf';
		// 	let u = new User(validUser);
		// 	u.save((e)
		// });
	});

	describe('POST /login', () => {
		it('login user - has email & password, matching password', (done) => {
			server
				.post('/api/auth/login')
				.send(loginVal)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.keys(userProps);
					done();
				});
		});

		it('NOT login user - has email & password, WRONG password', (done) => {
			server
				.post('/api/auth/login')
				.send(loginInvalWrongPass)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});

		it('NOT login user - WRONG FIELD eail & password', (done) => {
			server
				.post('/api/auth/login')
				.send(loginInvalWrongFieldName1)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
				});
			server
				.post('/api/auth/login')
				.send(loginInvalWrongFieldName2)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});
		it('NOT login user - MISSING FIELD email & password', (done) => {
			server
				.post('/api/auth/login')
				.send(loginInvalMissingEmail)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
				});
			server
				.post('/api/auth/login')
				.send(loginInvalMissingPass)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});
	});

	describe('POST /logout', () => {
		let refreshTokenPayload = {};

		beforeEach((done) => {
			User.deleteMany({}, () => {
				server
					.post('/api/auth/register')
					.send(validUser)
					.end((err, res) => {
						refreshTokenPayload.refreshToken = res.body.refreshToken;
						done();
					});
			});
		});

		it('logout user - has valid refresh token', (done) => {
			server
				.post('/api/auth/logout')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					done();
				});
		});
		it('logout user - has valid refresh token + miscellaneous fields', (done) => {
			refreshTokenPayload.some = 'some stuff';
			server
				.post('/api/auth/logout')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					done();
				});
		});
		it('NOT logout user - has invalid refresh token', (done) => {
			refreshTokenPayload.refreshToken = 'wrongvalue';
			server
				.post('/api/auth/logout')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(403);
					done();
				});
		});
		it('NOT logout user - has invalid token field name', (done) => {
			delete refreshTokenPayload.refreshToken;
			refreshTokenPayload.refeshToken = 'wrongvalue';
			server
				.post('/api/auth/logout')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});
	});

	describe('POST /token', () => {
		let refreshTokenPayload = {};
		beforeEach((done) => {
			// refreshTokenPayload = {};
			User.deleteMany({}, () => {
				server
					.post('/api/auth/register')
					.send(validUser)
					.end((err, res) => {
						refreshTokenPayload.refreshToken = res.body.refreshToken;
						done();
					});
			});
		});

		it('get new access token - valid refreshToken', (done) => {
			server
				.post('/api/auth/token')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.key('accessToken');
					done();
				});
		});

		it('get new access token - valid refreshToken + extra field', (done) => {
			refreshTokenPayload.some = 'somethig else';
			server
				.post('/api/auth/token')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.key('accessToken');
					done();
				});
		});

		it('NOT get new access token - invalid refreshToken', (done) => {
			refreshTokenPayload.refreshToken = 'somethigelse';
			server
				.post('/api/auth/token')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(403);
					done();
				});
		});

		it('NOT get new access token - missing refreshToken', (done) => {
			refreshTokenPayload = {};
			server
				.post('/api/auth/token')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});

		it("NOT get new access token - Wrong Field name 'refshToken'", (done) => {
			let wrongField = {};
			wrongField.refshToken = refreshTokenPayload.refreshToken;
			server
				.post('/api/auth/token')
				.send(wrongField)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					done();
				});
		});

		it('NOT get new access token - already logged out user', (done) => {
			server
				.post('/api/auth/logout')
				.send(refreshTokenPayload)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);

					server
						.post('/api/auth/token')
						.send(refreshTokenPayload)
						.end((err, res) => {
							expect(err).to.be.null;
							expect(res).to.have.status(400);
							done();
						});
				});
		});
	});
});
beforeEach((done) => {
	// User.find({}, (r) => {
	// 	log(r);
	// });
	User.deleteMany({}, () => {
		done();
	});
});
describe('QUICK TESTING', () => {
	// it('', (done) => {
	// 	// chai.request(app).post().
	// 	server
	// 		.post('/api/auth/register')
	// 		.send(validUser)
	// 		.end((err, res) => {
	// 			expect(err).to.be.null;
	// 			log(res.status);
	// 			log(res.header);
	// 			done();
	// 		});
	// });

	function logRes(res, method) {
		console.log(
			'\n\n',
			method,
			'\n\n',
			'STATUS:',
			res.status,
			// '\n',
			// 'HEADER:',
			// res.header,
			'\n',
			'BODY: ',
			res.body,
			'\n'
		);
	}

	// it.only('', async () => {
	// 	let a = await server.post('/api/auth/register').send(validUser);
	// 	// logRes(a);

	// 	let b = await server.post('/api/auth/login').send(loginVal);
	// 	// logRes(b);

	// 	let accToken = b.body.accessToken;
	// 	let refToken = b.body.refreshToken;
	// 	// log(accToken);
	// 	// log(refToken);

	// 	// let users = await User.find({});
	// 	// log(users);

	// 	let d = await server
	// 		.post('/api/auth/token')
	// 		.send({ refreshToken: refToken });
	// 	logRes(d);

	// 	let c = await server
	// 		.post('/api/auth/logout')
	// 		.send({ refreshToken: refToken });
	// 	logRes(c);
	// });

	it('', async () => {
		let a = await server.post('/api/auth/register').send(validUser);
		logRes(a, 'POST /auth/register');
		let b = await server.post('/api/auth/login').send(loginVal);
		logRes(b, 'POST /auth/login');

		let accToken = b.body.accessToken;
		let refToken = b.body.refreshToken;
		// let users = await User.find({});
		// log(users);

		let d = await server
			.post('/api/auth/token')
			.send({ refreshToken: refToken });
		logRes(d, 'POST /auth/token');

		let c = await server
			.post('/api/auth/logout')
			.send({ refreshToken: refToken });
		logRes(c, 'POST /auth/logout');
	});
});
