const bcrypt = require('bcryptjs');
const { filterObjPropsBy } = require('../utils/sanatizor');
const jwt = require('jsonwebtoken');
const { use } = require('chai');

const refreshToken = process.env.REFRESH_TOKEN_SECRET;
const accessToken = process.env.ACCESS_TOKEN_SECRET;

const submitFilter = ['nickname', 'password', 'email', 'salt'];

const returnFilter = ['_id', 'nickname'];

let User;
module.exports = class AuthService {
	constructor(userModel) {
		User = userModel;
	}

	registerUser(user) {
		user.salt = bcrypt.genSaltSync(10);
		user.password = bcrypt.hashSync(user.password, user.salt);

		let u = new User(filterObjPropsBy(user, submitFilter));
		// attachAccRefTokenGivenUser(u);

		let ud = getIdNick(u);

		return new Promise((resolve, reject) => {
			u.save((err, docUser) => {
				if (err) {
					// console.log(err);
					reject(err);
				} else {
					user = docUser.toJSON();
					// user.accessToken = genAccessToken(ud);
					// user.refreshToken = genRefreshToken(ud);
					// console.log(user);
					resolve(user);
				}
			});
		});
	}

	loginUser(loginfo) {
		return new Promise((resolve, reject) => {
			User.findOne({ email: loginfo.email })
				.then((user) => {
					let passwordMatch = bcrypt.compareSync(
						loginfo.password,
						user.password
					);
					if (!passwordMatch) {
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
				.catch((e) => reject('error while finding user'));
		});
	}

	logoutUser(user) {
		return new Promise((resolve, reject) => {
			User.findByIdAndUpdate(
				user._id,
				{ refreshToken: undefined },
				{ new: true }
			)
				.then((res) => {
					resolve('logged out');
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	newAccTokenUser(user) {
		return new Promise((resolve, reject) => {
			User.findById(user._id).then((doc) => {
				let doctok = doc.refreshToken;
				if (!doctok || doctok != user.refreshToken) {
					reject(
						'not a valid refreshToken OR a logged out user, try logging in again'
					);
				} else {
					resolve({ accessToken: genAccessToken(doc.toJSON()) });
				}
			});
		});
	}
};

function attachAccRefTokenGivenUser(userJson) {
	let uIdNick = getIdNick(userJson);
	userJson.accessToken = genAccessToken(uIdNick);
	userJson.refreshToken = genRefreshToken(uIdNick);
}

function getIdNick(user) {
	// console.log(user);
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
