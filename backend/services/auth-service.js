const bcrypt = require('bcryptjs');
const User = require('mongoose').model('User');
const { filterObjPropsBy } = require('../utils/sanatizor');
const jwt = require('jsonwebtoken');

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

	// create and attach REFRESH_TOKEN to user

	user.refreshToken = genRefreshToken(user);
	console.log(jwt.decode(user.refreshToken));

	return new Promise((resolve, reject) => {
		User.create(filterObjPropsBy(user, submitFilter))
			.then((dbUserDoc) => {
				console.log(dbUserDoc);
				let nUser = dbUserDoc.toFilteredJSON(returnFilter);
				// console.log(nUser);
				nUser.accessToken = genAccessToken(nUser);
				console.log(jwt.decode(nUser.accessToken));

				resolve(nUser);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

function logIn() {}

function genAccessToken(user) {
	return jwt.sign(toString(user._id), process.env.ACCESS_TOKEN_SECRET);
}

function genRefreshToken(user) {
	return jwt.sign(user.email, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = {
	registerUser,
};
