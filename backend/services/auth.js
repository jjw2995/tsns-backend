const bcrypt = require('bcryptjs');
const User = require('mongoose').model('User');
const { filterObjPropsBy } = require('../utils/sanatizor');

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

function genSaltHasPassword(user) {
	user.salt = bcrypt.genSaltSync(10);
	user.password = bcrypt.hashSync(user.password, user.salt);
}

function registerUser(user) {
	const keys = ['nickname', 'password', 'email', 'salt'];
	genSaltHasPassword(user);
	let a = new User();

	return new Promise((resolve, reject) => {
		User.create(filterObjPropsBy(user, keys))
			.then((dbUserDoc) => {
				// console.log('\n', dbUserDoc, '\n');
				// return done(null, {_id: dbUserDoc._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
				// return done(null, {_id: dbUserDoc._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
				console.log(dbUserDoc);
				resolve(dbUserDoc.toFilteredJSON(['nickname', 'email']));
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
