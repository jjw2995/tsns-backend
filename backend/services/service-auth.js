const bcrypt = require('bcryptjs');
const { filterObjPropsBy } = require('../utils/sanatizor');
const jwt = require('jsonwebtoken');

const test = require('mongoose').model('User');

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const submitFilter = ['nickname', 'password', 'email', 'salt', 'isPrivate'];

const returnFilter = ['_id', 'nickname'];

function log(msg) {
	console.log('\n\n', msg);
}
let User;
module.exports = class AuthService {
	constructor(userModel) {
		User = userModel;
	}

	registerUser(user) {
		user.salt = bcrypt.genSaltSync(10);
		user.password = bcrypt.hashSync(user.password, user.salt);

		return new Promise((resolve, reject) => {
			User.create(user)
				.then((r) => {
					resolve(r.toJSON());
				})
				.catch((e) => {
					reject({ errors: [{ email: e.errors.email.properties.message }] });
				});
		});
	}

	async loginUser(loginfo) {
		let user = await User.findOne({ email: loginfo.email });
		if (!user) throw { error: `no user with email "${loginfo.email}"` };

		let passwordMatch = bcrypt.compareSync(loginfo.password, user.password);

		if (!passwordMatch) throw { error: 'wrong password or email' };

		let userJson = user.toJSON();
		attachAccRefTokenGivenUser(userJson);

		await user.updateOne({ refreshToken: userJson.refreshToken });
		return userJson;
	}

	logoutUser(user) {
		return new Promise((resolve, reject) => {
			test
				.findOneAndUpdate(
					{ _id: user._id, refreshToken: user.refreshToken },
					{ refreshToken: undefined },
					{ new: true }
				)
				.then((res) => {
					resolve();
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
					reject({
						error:
							'not a valid refreshToken OR a logged out user, try logging in again',
					});
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
	return jwt.sign(user, ACCESS_TOKEN_SECRET, {
		expiresIn: '30m',
	});
}

function genRefreshToken(user) {
	return jwt.sign(user, REFRESH_TOKEN_SECRET, {
		expiresIn: '7d',
	});
}
