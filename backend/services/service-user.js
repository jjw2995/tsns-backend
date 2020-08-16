const riend = require('mongoose').model('User');
const bcrypt = require('bcryptjs');

let log = (m) => console.log('\n', m, '\n');
let User;

// function getUsersIdx (target, other) {
//     return target._id < other._id ? 0 : 1
// }

module.exports = class UserService {
	constructor(user) {
		User = user;
	}
	getUser(user) {
		return new Promise((resolve, reject) => {
			User.findById(user._id)
				.then((r) => {
					if (!r) return reject(Error('such user does not exist'));
					resolve(r.toJSON());
				})
				.catch((e) => reject(e));
		});
	}

	// async checkUser(id) {
	// 	let user = await User.findById(id);
	// 	return user;
	// }
};
