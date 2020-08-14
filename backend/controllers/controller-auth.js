const { AuthService } = require('../services');
const User = require('mongoose').model('User');
/*
 * call other imported services, or same service but different functions here if you need to
 */

let authService = new AuthService(User);

const postRegister = (req, res) => {
	authService
		.registerUser(req.body)
		.then((newUser) => res.status(200).json(newUser))
		.catch((e) => {
			res.status(400).json(e.message);
		});
};

const postLogin = (req, res) => {
	authService
		.loginUser(req.body)
		.then((user) => {
			res.status(200).json(user);
		})
		.catch((e) => {
			res.status(400).json(e);
		});
};

const postLogout = (req, res) => {
	authService
		.logoutUser(req.user)
		.then((user) => res.status(200).send('sucessfully logged out'))
		.catch((e) => res.status(400).json(e));
};

const postToken = (req, res) => {
	authService
		.newAccTokenUser(req.user)
		.then((token) => {
			res.status(200).json(token);
		})
		.catch((e) => res.status(400).json(e));
};

//=======================================================
//=======================================================
//=======================================================
const getRegister = (req, res) => {
	User.deleteMany({}, (err, output) => {
		if (err) {
			console.log(err);
		} else {
			res.json(output);
		}
	});
};

module.exports = {
	postRegister,
	postLogin,
	getRegister,
	postLogout,
	postToken,
};
