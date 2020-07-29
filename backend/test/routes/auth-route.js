const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const { assert } = require('chai');
const User = require('mongoose').model('User');

// assertion style
chai.should();

chai.use(chaiHttp);

const host = 'http://localhost:5000';

// let server;

// before(async () => {
// 	server = await chai.request(app).keepOpen();
// 	console.log('in b4');
// 	// const User = require('mongoose').model('User');
// });

// after(() => {
// 	server.close;
// });

let server;
before(async () => {
	server = await chai.request(app).keepOpen();

	console.log('in b4');
	// const User = require('mongoose').model('User');
});

after(() => {
	server.close;
});

describe('auth-api-route', () => {
	describe('POST register', () => {
		//
		beforeEach((done) => {
			User.deleteMany({}, (err) => {
				if (err) console.log(err);
				else done();
			});
		});

		it('should register user - good input', (done) => {
			server.get('/api/auth').end((err, res) => {
				if (err) assert.fail('err');
				else done();
			});
		});

		it('should register user - good input', (done) => {
			server.get('/api/auth').end((err, res) => {
				if (err) assert.fail('err');
				else done();
			});
		});
	});

	// it('should fail to register user - repeated input', () => {});

	// it('should NOT register user - bad input', () => {});
});
