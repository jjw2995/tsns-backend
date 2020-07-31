const chai = require('chai');
// const chaiHttp = require('chai-http');
const app = require('../app');
const { assert, should } = require('chai');
const { json } = require('express');
const User = require('mongoose').model('User');

chai.use(require('chai-http'));

// assertion style
const expect = chai.expect;
chai.should();

let server;

before(async () => {
	server = await chai.request(app).keepOpen();
});

after(() => {
	server.close;
});

function handleErr(e) {
	if (e) assert.fail('err');
}

// let server = chai.request(app);

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

function resetDB(done) {
	User.deleteMany({}, () => {
		done();
	});
}
describe('/api/auth', () => {
	describe('POST /register', () => {
		//
		beforeEach((done) => {
			User.deleteMany({}, () => {
				done();
			});
			// server;
		});
		// chai.request().post().
		it('should register user - has all required input, no miscellaneous fields', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// expect(res.body).to.contain([
					// 	'_id',
					// 	'nickname',
					// 	'accessToken',
					// 	'refreshToken',
					// ]);
					expect(res.body).to.have.keys([
						'_id',
						'nickname',
						'accessToken',
						'refreshToken',
					]);
					done();
				});
		});

		it('should register user - has all required input, YES miscellaneous fields', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.keys([
						'_id',
						'nickname',
						'accessToken',
						'refreshToken',
					]);
					done();
				});
		});

		it('should NOT register user - missing required input', (done) => {
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

		it('should NOT register user - missing required input', (done) => {
			server
				.post('/api/auth/register')
				.send(validUser)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.keys([
						'_id',
						'nickname',
						'accessToken',
						'refreshToken',
					]);
					next();
					// done();
				});
			function next() {
				server
					.post('/api/auth/register')
					.send(validUser)
					.end((err, res) => {
						// if (err) done(err);
						expect(err).to.be.null;
						expect(res).to.have.status(400);
						// console.log(err);
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

	describe('POST login', () => {});
	// it('should fail to register user - repeated input', () => {});

	// it('should NOT register user - bad input', () => {});
});
