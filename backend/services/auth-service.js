const bcrypt = require('bcryptjs');
const User = require('mongoose').model('User');
const { filterObjPropsBy } = require('../utils/sanatizor');
const jwt = require('jsonwebtoken');

const refreshToken = process.env.REFRESH_TOKEN_SECRET;
const accessToken = process.env.ACCESS_TOKEN_SECRET;

{
	/*
	 * if you need to make calls to additional tables, data stores (Redis, for example),
	 * or call an external endpoint as part of creating the blogpost, add them to this service
	 */
	//  input
	// {
	//   nickname:String,
	//   email:String,
	//   password:String
	// }
	//  output
	// {
	//   nickname:String,
	//   id:String
	//   ACCESS_TOKEN:
	//   REFRESH_TOKEN:
	// }
}
const submitFilter = ['nickname', 'password', 'email', 'salt', 'refreshToken'];

const returnFilter = ['_id', 'nickname'];

function registerUser(user) {
	user.salt = bcrypt.genSaltSync(10);
	user.password = bcrypt.hashSync(user.password, user.salt);

	let u = new User(filterObjPropsBy(user, submitFilter));
	console.log('\n	HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE\n');
	attachAccRefTokenGivenUser(u);

	let ud = getIdNick(u);

	user.refreshToken = genRefreshToken(ud);
	// console.log(jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET));

	return new Promise((resolve, reject) => {
		u.save((err, product) => {
			if (err) reject(err);
			else {
				user = product.toJSON();
				user.accessToken = genAccessToken(ud);
				resolve(user);
			}
		});
	});
}

function loginUser(loginfo) {
	return new Promise((resolve, reject) => {
		User.findOne({ email: loginfo.email })
			.then((user) => {
				let tf = bcrypt.compareSync(loginfo.password, user.password);
				if (!tf) {
					return reject('wrong password or email');
				}
				let userJson = user.toJSON();
				attachAccRefTokenGivenUser(userJson);

				user
					.updateOne({ refreshToken: userJson.refreshToken })
					.then((u) => {
						resolve(userJson);
					})
					.catch((e) => reject('error updating refreshToken'));
			})
			.catch((e) => console.log(e));
	});
}

function attachAccRefTokenGivenUser(userJson) {
	let uIdNick = getIdNick(userJson);
	userJson.accessToken = genAccessToken(uIdNick);
	userJson.refreshToken = genRefreshToken(uIdNick);
}

function getIdNick(user) {
	return filterObjPropsBy(user, ['_id', 'nickname']);
}

function genAccessToken(user) {
	return jwt.sign(user, accessToken, {
		expiresIn: '30m',
	});
}

function genRefreshToken(user) {
	return jwt.sign(user, refreshToken, {
		expiresIn: '7d',
	});
}

module.exports = {
	registerUser,
	loginUser,
};
