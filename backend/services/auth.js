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

function registerUser(user) {
	user.salt = bcrypt.genSaltSync(10);
	user.password = bcrypt.hashSync(user.password, user.salt);

	// create and attach REFRESH_TOKEN to user
	user.refreshToken = jwt.sign(user.nickname, process.env.REFRESH_TOKEN_SECRET);
	console.log(user.refreshToken);

	const filterKeys = ['nickname', 'password', 'email', 'salt', 'refreshToken'];

	return new Promise((resolve, reject) => {
		User.create(filterObjPropsBy(user, filterKeys))
			.then((dbUserDoc) => {
				// attach accessToken here

				// return done(null, {_id: dbUserDoc._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
				console.log(dbUserDoc);
				console.log(user.refreshToken);
				let nUser = dbUserDoc.toFilteredJSON([
					'_id',
					'nickname',
					'email',
					'refreshToken',
				]);

				nUser.accessToken = jwt.sign(
					user.nickname,
					process.env.ACCESS_TOKEN_SECRET
				);

				resolve(nUser);
			})
			.catch((e) => {
				// e.
				reject(e);
			});
	});
}

module.exports = {
	registerUser,
};
